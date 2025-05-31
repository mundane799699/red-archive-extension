// 检查是否是小红书页面
function isXiaohongshuPage() {
  return (
    window.location.hostname.includes("xiaohongshu.com") ||
    window.location.hostname.includes("xhslink.com")
  );
}

// 检查是否是抖音页面
function isDouyinPage() {
  return window.location.hostname.includes("douyin.com");
}

// 根据页面类型注入对应的脚本
function injectScript() {
  let scriptFile = null;

  if (isXiaohongshuPage()) {
    scriptFile = "scripts/xhsPageInjectScript.js";
    console.log("检测到小红书页面，注入小红书脚本");
  } else if (isDouyinPage()) {
    scriptFile = "scripts/douyinPageInjectScript.js";
    console.log("检测到抖音页面，注入抖音脚本");
  }

  if (scriptFile) {
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", chrome.runtime.getURL(scriptFile));
    document.documentElement.appendChild(script);
  } else {
    console.log("当前页面不是支持的平台");
  }
}

// 执行脚本注入
injectScript();

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

    // 获取数据类型和平台信息
    const dataType = event.data.dataType;
    const platform = event.data.platform;

    // 发送消息到background.js
    try {
      chrome.runtime.sendMessage(
        {
          dataType: dataType,
          platform: platform,
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
          console.log(`${platform} ${dataType}数据已发送到background script`);
        }
      );
    } catch (error) {
      console.log("发送消息失败，扩展可能已被禁用或卸载", error);
    }
  }
});
