var ajax_open_original = XMLHttpRequest.prototype.open;

// 提取用户主页第一页数据
function extractFirstPageData() {
  try {
    // 判断是否在用户主页页面
    if (window.location.href.includes("/user/profile/")) {
      console.log("检测到小红书用户主页，开始提取第一页数据");

      // 尝试获取__INITIAL_STATE__中的数据
      if (
        window.__INITIAL_STATE__ &&
        window.__INITIAL_STATE__.user &&
        window.__INITIAL_STATE__.user.notes
      ) {
        const notes = window.__INITIAL_STATE__.user.notes._rawValue;

        // 构建数据对象
        const extractedNotes = [];

        for (const item of notes[0]) {
          try {
            const { noteCard } = item;
            if (!noteCard) continue;

            const {
              interactInfo,
              user,
              displayTitle,
              noteId,
              xsecToken,
              type,
            } = noteCard;
            const likedCount = interactInfo ? interactInfo.likedCount : 0;
            const nickname = user ? user.nickName : "";
            const userId = user ? user.userId : "";

            // 构建符合后端期望格式的数据对象
            const noteData = {
              note_id: noteId,
              display_title: displayTitle || "",
              type,
              user: {
                nickname,
                user_id: userId,
              },
              interact_info: {
                liked_count: likedCount,
              },
              xsec_token: xsecToken,
            };

            extractedNotes.push(noteData);
          } catch (err) {
            console.log("处理单个笔记时出错", err);
          }
        }

        if (extractedNotes.length > 0) {
          // 构建完整响应对象
          const response = {
            code: 0,
            success: true,
            msg: "成功",
            data: {
              notes: extractedNotes,
              has_more: false,
            },
          };

          // 发送到content script
          window.postMessage(
            {
              type: "FROM_INJECTED",
              dataType: "homepage",
              payload: {
                url: window.location.href,
                responseText: JSON.stringify(response),
              },
            },
            "*"
          );

          console.log(
            "第一页数据提取完成，共提取了",
            extractedNotes.length,
            "条笔记"
          );
        }
      } else {
        console.log("未找到__INITIAL_STATE__数据或数据结构不符合预期");
      }
    }
  } catch (error) {
    console.log("第一页数据提取失败", error);
  }
}

function intercept_ajax() {
  XMLHttpRequest.prototype.open = function () {
    var open_arguments = arguments;
    var method = open_arguments[0].toLowerCase();
    var url = open_arguments[1];

    this.addEventListener("readystatechange", function (event) {
      if (
        url.includes("/api/sns/web/v1/search/notes") &&
        this.readyState === 4
      ) {
        console.log("拦截到搜索请求, url = ", url);

        // 发送消息到content script
        window.postMessage(
          {
            type: "FROM_INJECTED",
            dataType: "search",
            payload: {
              url: url,
              responseText: event.target.responseText,
            },
          },
          "*"
        );
      }

      // 拦截用户主页帖子请求
      if (
        url.includes("/api/sns/web/v1/user_posted") &&
        this.readyState === 4
      ) {
        console.log("拦截到用户主页帖子请求, url = ", url);

        // 发送消息到content script
        window.postMessage(
          {
            type: "FROM_INJECTED",
            dataType: "homepage",
            payload: {
              url: url,
              responseText: event.target.responseText,
            },
          },
          "*"
        );
      }
    });

    return ajax_open_original.apply(this, open_arguments);
  };
}

// 执行拦截
intercept_ajax();

// 等待页面加载完成后执行提取第一页数据
window.addEventListener("load", function () {
  extractFirstPageData();
});
