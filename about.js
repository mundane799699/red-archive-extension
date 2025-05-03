// 获取扩展版本号
const getExtensionVersion = () => {
  const manifest = chrome.runtime.getManifest();
  return manifest.version;
};

// 切换标签页
const switchTab = (tabId) => {
  // 移除所有标签页和内容区域的活动状态
  document.querySelectorAll(".sidebar-menu li").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelectorAll(".content-panel").forEach((item) => {
    item.classList.remove("active");
  });

  // 为当前标签页和对应内容区域添加活动状态
  document.getElementById(tabId).classList.add("active");
  if (tabId === "search-tab") {
    document.getElementById("search-panel").classList.add("active");
  } else if (tabId === "homepage-tab") {
    document.getElementById("homepage-panel").classList.add("active");
  }
};

// 显示版本号并设置事件监听器
document.addEventListener("DOMContentLoaded", () => {
  // 显示版本号
  const versionElement = document.getElementById("version");
  try {
    const version = getExtensionVersion();
    versionElement.textContent = version;
  } catch (error) {
    versionElement.textContent = "获取失败";
    console.error("获取版本号失败:", error);
  }

  // 设置标签切换事件
  document
    .getElementById("search-tab")
    .addEventListener("click", () => switchTab("search-tab"));
  document
    .getElementById("homepage-tab")
    .addEventListener("click", () => switchTab("homepage-tab"));
});
