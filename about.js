// 获取扩展版本号
const getExtensionVersion = () => {
  const manifest = chrome.runtime.getManifest();
  return manifest.version;
};

// 显示版本号
document.addEventListener("DOMContentLoaded", () => {
  const versionElement = document.getElementById("version");
  try {
    const version = getExtensionVersion();
    versionElement.textContent = version;
  } catch (error) {
    versionElement.textContent = "获取失败";
    console.error("获取版本号失败:", error);
  }
});
