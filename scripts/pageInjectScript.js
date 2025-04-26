var ajax_open_original = XMLHttpRequest.prototype.open;

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
