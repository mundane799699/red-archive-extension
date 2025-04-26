import { getAllData, clearAllData } from "./db.js";

// 将数据转换为CSV格式
const convertToCSV = (data) => {
  // CSV表头
  const headers = ["ID", "标题", "链接", "类型", "用户ID", "昵称", "时间戳"];

  // 转换数据行
  const rows = data.map((item) => {
    const link = `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`;
    return [
      item.id,
      item.display_title || "",
      link,
      item.type,
      item.user_id,
      item.nickname,
      new Date(item.timestamp).toLocaleString(),
    ];
  });

  // 组合表头和数据行
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// 导出数据
const exportData = async () => {
  try {
    const data = await getAllData();
    if (data.length === 0) {
      document.getElementById("status").textContent = "暂无数据可导出";
      return;
    }

    // 转换为CSV格式
    const csvContent = convertToCSV(data);

    // 创建Blob对象
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // 下载文件
    chrome.downloads.download({
      url: url,
      filename: `xhs-data-${timestamp}.csv`,
      saveAs: true,
    });

    document.getElementById("status").textContent = "数据导出成功！";
  } catch (error) {
    document.getElementById("status").textContent =
      "导出失败：" + error.message;
  }
};

// 清除数据
const clearData = async () => {
  try {
    await clearAllData();
    document.getElementById("status").textContent = "数据已清除！";
  } catch (error) {
    document.getElementById("status").textContent =
      "清除失败：" + error.message;
  }
};

// 添加事件监听器
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("exportData").addEventListener("click", exportData);
  document.getElementById("clearData").addEventListener("click", clearData);
  document.getElementById("viewData").addEventListener("click", () => {
    chrome.tabs.create({ url: "data.html" });
  });
});
