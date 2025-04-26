import { getAllData, clearAllData } from "./db.js";

// 渲染数据到表格
const renderData = (data) => {
  const tbody = document.getElementById("dataBody");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");
    const link = `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`;

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.display_title || ""}</td>
      <td><a href="${link}" target="_blank" class="link">查看</a></td>
      <td>${item.type}</td>
      <td>${item.user_id}</td>
      <td>${item.nickname}</td>
      <td>${new Date(item.timestamp).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
};

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
  if (!confirm("确定要清除所有数据吗？此操作不可恢复！")) {
    return;
  }

  try {
    await clearAllData();
    document.getElementById("status").textContent = "数据已清除！";
    document.getElementById("dataBody").innerHTML = "";
  } catch (error) {
    document.getElementById("status").textContent =
      "清除失败：" + error.message;
  }
};

// 刷新数据
const refreshData = async () => {
  document.getElementById("status").textContent = "正在刷新...";
  try {
    const data = await getAllData();
    if (data.length === 0) {
      document.getElementById("status").textContent = "暂无数据";
      document.getElementById("dataBody").innerHTML = "";
      return;
    }
    renderData(data);
    document.getElementById("status").textContent = `共 ${data.length} 条数据`;
  } catch (error) {
    document.getElementById("status").textContent =
      "刷新失败：" + error.message;
  }
};

// 初始化页面
const initPage = async () => {
  try {
    const data = await getAllData();
    if (data.length === 0) {
      document.getElementById("status").textContent = "暂无数据";
      return;
    }
    renderData(data);
    document.getElementById("status").textContent = `共 ${data.length} 条数据`;
  } catch (error) {
    document.getElementById("status").textContent =
      "加载失败：" + error.message;
  }
};

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  initPage();
  document.getElementById("refreshData").addEventListener("click", refreshData);
  document.getElementById("exportData").addEventListener("click", exportData);
  document.getElementById("clearData").addEventListener("click", clearData);
});
