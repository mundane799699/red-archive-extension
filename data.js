import { getAllData, clearAllData } from "./db.js";

// 添加排序状态变量
let originalData = [];
let currentSortColumn = null;
let currentSortOrder = 0; // 0: 无排序, 1: 升序, 2: 降序

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

// 添加排序函数
const sortData = (column) => {
  if (currentSortColumn === column) {
    currentSortOrder = (currentSortOrder + 1) % 3;
  } else {
    currentSortColumn = column;
    currentSortOrder = 1;
  }

  let sortedData;
  if (currentSortOrder === 0) {
    // 恢复原始顺序
    sortedData = [...originalData];
  } else {
    sortedData = [...originalData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (column === "timestamp") {
        aValue = new Date(a[column]).getTime();
        bValue = new Date(b[column]).getTime();
      } else {
        aValue = a[column] || 0;
        bValue = b[column] || 0;
      }

      return currentSortOrder === 1 ? aValue - bValue : bValue - aValue;
    });
  }

  renderData(sortedData);
  updateSortIndicators();
};

// 更新表格排序状态的视觉指示器
const updateSortIndicators = () => {
  // 获取所有表头元素
  const headers = document.querySelectorAll("th");

  // 首先移除所有表头的排序状态类名
  // 这样可以清除之前的排序状态显示
  headers.forEach((header) => {
    header.classList.remove("sorted-asc", "sorted-desc");
  });

  // 只有当存在排序列且排序状态不为0（即不是默认状态）时才添加排序指示器
  if (currentSortColumn && currentSortOrder !== 0) {
    // 查找当前正在排序的列的表头元素
    const header = document.querySelector(
      `th[data-column="${currentSortColumn}"]`
    );

    // 如果找到了对应的表头元素
    if (header) {
      // 根据排序顺序添加对应的类名
      // currentSortOrder为1时添加sorted-asc（升序）
      // currentSortOrder为2时添加sorted-desc（降序）
      header.classList.add(
        currentSortOrder === 1 ? "sorted-asc" : "sorted-desc"
      );
    }
  }
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

// 获取当前显示的数据
const getCurrentDisplayData = () => {
  if (currentSortColumn && currentSortOrder !== 0) {
    // 如果有排序，返回排序后的数据
    return [...originalData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (currentSortColumn === "timestamp") {
        aValue = new Date(a[currentSortColumn]).getTime();
        bValue = new Date(b[currentSortColumn]).getTime();
      } else {
        aValue = a[currentSortColumn] || 0;
        bValue = b[currentSortColumn] || 0;
      }

      return currentSortOrder === 1 ? aValue - bValue : bValue - aValue;
    });
  }
  // 如果没有排序，返回原始数据
  return originalData;
};

// 导出数据
const exportData = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentDisplayData();
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
    // 使用当前显示的数据顺序
    const data = getCurrentDisplayData();
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

// 重置排序状态
const resetSortState = () => {
  currentSortColumn = null;
  currentSortOrder = 0;
  updateSortIndicators();
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
    originalData = data;
    // 重置排序状态
    resetSortState();
    // 使用原始数据顺序渲染
    renderData(data);
    document.getElementById("status").textContent = `共 ${data.length} 条数据`;
  } catch (error) {
    document.getElementById("status").textContent =
      "刷新失败：" + error.message;
  }
};

// 清除数据
const clearData = async () => {
  if (!confirm("确定要清除所有数据吗？此操作不可恢复！")) {
    return;
  }

  try {
    await clearAllData();
    // 重置排序状态
    resetSortState();
    document.getElementById("status").textContent = "数据已清除！";
    document.getElementById("dataBody").innerHTML = "";
  } catch (error) {
    document.getElementById("status").textContent =
      "清除失败：" + error.message;
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
    originalData = data;
    // 初始化时确保排序状态为重置状态
    resetSortState();
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

  // 添加表头点击事件
  const headers = document.querySelectorAll("th");
  headers.forEach((header) => {
    const column = header.textContent.trim();
    // 定义可排序列的映射关系
    const columnMapping = {
      点赞数: "liked_count",
      评论数: "comment_count",
      分享数: "shared_count",
      收藏数: "collected_count",
      时间戳: "timestamp",
    };

    // 如果是可排序的列，添加排序功能
    if (columnMapping[column]) {
      header.setAttribute("data-column", columnMapping[column]);
      header.style.cursor = "pointer";
      header.addEventListener("click", () => sortData(columnMapping[column]));
    }
  });
});
