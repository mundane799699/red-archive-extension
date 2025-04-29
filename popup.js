import { getAllData, clearAllData } from "./db.js";

// 添加事件监听器
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("viewData").addEventListener("click", () => {
    chrome.tabs.create({ url: "data.html" });
  });

  document.getElementById("howToUse").addEventListener("click", () => {
    chrome.tabs.create({ url: "about.html" });
  });
});
