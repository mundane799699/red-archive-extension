const script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute(
  "src",
  chrome.runtime.getURL("scripts/pageInjectScript.js")
);
document.documentElement.appendChild(script);

// 检查是否是小红书用户主页
function isUserProfilePage() {
  return window.location.href.includes("/user/profile/");
}

// 当页面加载完成后检查
window.addEventListener("load", function () {
  if (isUserProfilePage()) {
    console.log("检测到小红书用户主页");
  }
});

// 监听来自注入脚本的消息
window.addEventListener("message", function (event) {
  if (event.data.type === "FROM_INJECTED") {
    console.log("收到注入脚本消息:", event.data.payload);
    // 获取数据类型
    const dataType = event.data.dataType || "search"; // 默认为search类型

    // 发送消息到background.js
    try {
      chrome.runtime.sendMessage(
        {
          type: dataType === "homepage" ? "HOMEPAGE_RESULT" : "SEARCH_RESULT",
          responseText: event.data.payload.responseText,
          url: event.data.payload.url,
        },
        (response) => {
          // 检查是否有错误
          if (chrome.runtime.lastError) {
            console.log("扩展上下文已失效，可能需要重新加载扩展");
            return;
          }
          console.log("response", response);
          console.log(`${dataType}数据已发送到background script`);
        }
      );
    } catch (error) {
      console.log("发送消息失败，扩展可能已被禁用或卸载", error);
    }
  }
});
