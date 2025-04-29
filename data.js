import { getAllData, clearAllData } from "./db.js";

// 渲染数据到表格
const renderData = (data) => {
  const tbody = document.getElementById("dataBody");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");
    const noteLink = `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`;
    const authorLink = `https://www.xiaohongshu.com/user/profile/${item.user_id}`;
    row.innerHTML = `
      <td>${item.display_title || ""}</td>
      <td><a href="${noteLink}" target="_blank" class="link">查看</a></td>
      <td>${item.type}</td>
      <td><a href="${authorLink}" target="_blank" class="link">查看</a></td>
      <td>${item.nickname}</td>
      <td>${item.liked_count || 0}</td>
      <td>${item.comment_count || 0}</td>
      <td>${item.shared_count || 0}</td>
      <td>${item.collected_count || 0}</td>
      <td>${new Date(item.timestamp).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
};

// 将数据转换为CSV格式
const convertToCSV = (data) => {
  // CSV表头
  const headers = [
    "标题",
    "链接",
    "类型",
    "作者",
    "昵称",
    "点赞数",
    "评论数",
    "分享数",
    "收藏数",
    "时间戳",
  ];

  // 转换数据行
  const rows = data.map((item) => {
    const noteLink = `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`;
    const authorLink = `https://www.xiaohongshu.com/user/profile/${item.user_id}`;
    return [
      item.display_title || "",
      noteLink,
      item.type,
      authorLink,
      item.nickname,
      item.liked_count || 0,
      item.comment_count || 0,
      item.shared_count || 0,
      item.collected_count || 0,
      new Date(item.timestamp).toLocaleString(),
    ];
  });

  // 组合表头和数据行
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// 将数据转换为TXT格式（仅链接）
const convertToTXT = (data) => {
  return data
    .map((item) => {
      const link = `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`;
      return link;
    })
    .join("\n");
};

// 格式化导出文件名的时间戳
const formatExportTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
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
    const timestamp = formatExportTimestamp();

    // 下载文件
    chrome.downloads.download({
      url: url,
      filename: `xhs-search-${timestamp}.csv`,
      saveAs: true,
    });

    document.getElementById("status").textContent = "数据导出成功！";
  } catch (error) {
    document.getElementById("status").textContent =
      "导出失败：" + error.message;
  }
};

// 导出数据为TXT
const exportTXT = async () => {
  try {
    const data = await getAllData();
    if (data.length === 0) {
      document.getElementById("status").textContent = "暂无数据可导出";
      return;
    }

    // 转换为TXT格式
    const txtContent = convertToTXT(data);

    // 创建Blob对象
    const blob = new Blob([txtContent], {
      type: "text/plain;charset=utf-8;",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const timestamp = formatExportTimestamp();

    // 下载文件
    chrome.downloads.download({
      url: url,
      filename: `xhs-links-${timestamp}.txt`,
      saveAs: true,
    });

    document.getElementById("status").textContent = "链接导出成功！";
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
  document.getElementById("exportTXT").addEventListener("click", exportTXT);
  document.getElementById("clearData").addEventListener("click", clearData);
});
