var ajax_open_original = XMLHttpRequest.prototype.open;

function intercept_ajax() {
  XMLHttpRequest.prototype.open = function () {
    var open_arguments = arguments;
    var method = open_arguments[0].toLowerCase();
    var url = open_arguments[1];

    this.addEventListener("readystatechange", function (event) {
      // 拦截搜索请求
      if (url.includes("/aweme/v1/web/search/") && this.readyState === 4) {
        console.log("拦截到抖音搜索请求, url = ", url);

        // 发送消息到content script
        window.postMessage(
          {
            type: "FROM_INJECTED",
            dataType: "search",
            platform: "douyin",
            payload: {
              url: url,
              responseText: event.target.responseText,
            },
          },
          "*"
        );
      }

      // 拦截用户主页视频请求
    });

    return ajax_open_original.apply(this, open_arguments);
  };
}

// 执行拦截
intercept_ajax();

console.log("抖音页面注入脚本已加载");
