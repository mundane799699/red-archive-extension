import {
  getAllData,
  clearAllData,
  getAllHomepageData,
  clearAllHomepageData,
  getAllDouyinSearchData,
  clearAllDouyinSearchData,
} from "./db.js";

// 添加排序状态变量
let originalData = [];
let originalHomepageData = [];
let originalDouyinSearchData = [];
let currentSortColumn = null;
let currentSortOrder = 0; // 0: 无排序, 1: 升序, 2: 降序
let currentHomepageSortColumn = null;
let currentHomepageSortOrder = 0; // 0: 无排序, 1: 升序, 2: 降序
let currentDouyinSearchSortColumn = null;
let currentDouyinSearchSortOrder = 0; // 0: 无排序, 1: 升序, 2: 降序

// 渲染搜索数据到表格
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

// 渲染主页数据到表格
const renderHomepageData = (data) => {
  const tbody = document.getElementById("homepageBody");
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
      <td>${new Date(item.timestamp).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
};

// 渲染抖音搜索数据到表格
const renderDouyinSearchData = (data) => {
  const tbody = document.getElementById("douyinSearchBody");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.desc || ""}</td>
      <td><a href="${
        item.douyin_url
      }" target="_blank" class="link">查看</a></td>
      <td>${item.nickname}</td>
      <td><a href="${
        item.author_url
      }" target="_blank" class="link">查看</a></td>
      <td><a href="${item.video_url}" target="_blank" class="link">播放</a></td>
      <td>${item.digg_count || 0}</td>
      <td>${item.collect_count || 0}</td>
      <td>${item.share_count || 0}</td>
      <td>${item.comment_count || 0}</td>
      <td>${new Date(item.timestamp).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
};

// 添加排序函数 - 搜索数据
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
  updateSortIndicators("dataTable");
};

// 添加排序函数 - 主页数据
const sortHomepageData = (column) => {
  if (currentHomepageSortColumn === column) {
    currentHomepageSortOrder = (currentHomepageSortOrder + 1) % 3;
  } else {
    currentHomepageSortColumn = column;
    currentHomepageSortOrder = 1;
  }

  let sortedData;
  if (currentHomepageSortOrder === 0) {
    // 恢复原始顺序
    sortedData = [...originalHomepageData];
  } else {
    sortedData = [...originalHomepageData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (column === "timestamp") {
        aValue = new Date(a[column]).getTime();
        bValue = new Date(b[column]).getTime();
      } else {
        aValue = a[column] || 0;
        bValue = b[column] || 0;
      }

      return currentHomepageSortOrder === 1 ? aValue - bValue : bValue - aValue;
    });
  }

  renderHomepageData(sortedData);
  updateSortIndicators("homepageTable");
};

// 添加排序函数 - 抖音搜索数据
const sortDouyinSearchData = (column) => {
  if (currentDouyinSearchSortColumn === column) {
    currentDouyinSearchSortOrder = (currentDouyinSearchSortOrder + 1) % 3;
  } else {
    currentDouyinSearchSortColumn = column;
    currentDouyinSearchSortOrder = 1;
  }

  let sortedData;
  if (currentDouyinSearchSortOrder === 0) {
    // 恢复原始顺序
    sortedData = [...originalDouyinSearchData];
  } else {
    sortedData = [...originalDouyinSearchData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (column === "timestamp") {
        aValue = new Date(a[column]).getTime();
        bValue = new Date(b[column]).getTime();
      } else {
        aValue = a[column] || 0;
        bValue = b[column] || 0;
      }

      return currentDouyinSearchSortOrder === 1
        ? aValue - bValue
        : bValue - aValue;
    });
  }

  renderDouyinSearchData(sortedData);
  updateSortIndicators("douyinSearchTable");
};

// 更新表格排序状态的视觉指示器
const updateSortIndicators = (tableId) => {
  // 获取所有表头元素
  const headers = document.querySelectorAll(`#${tableId} th`);
  const isHomepage = tableId === "homepageTable";
  const isDouyinSearch = tableId === "douyinSearchTable";

  let currentColumn, currentOrder;

  if (isHomepage) {
    currentColumn = currentHomepageSortColumn;
    currentOrder = currentHomepageSortOrder;
  } else if (isDouyinSearch) {
    currentColumn = currentDouyinSearchSortColumn;
    currentOrder = currentDouyinSearchSortOrder;
  } else {
    currentColumn = currentSortColumn;
    currentOrder = currentSortOrder;
  }

  // 首先移除所有表头的排序状态类名
  headers.forEach((header) => {
    header.classList.remove("sorted-asc", "sorted-desc");
  });

  // 只有当存在排序列且排序状态不为0（即不是默认状态）时才添加排序指示器
  if (currentColumn && currentOrder !== 0) {
    // 查找当前正在排序的列的表头元素
    const header = document.querySelector(
      `#${tableId} th[data-column="${currentColumn}"]`
    );

    // 如果找到了对应的表头元素
    if (header) {
      // 根据排序顺序添加对应的类名
      header.classList.add(currentOrder === 1 ? "sorted-asc" : "sorted-desc");
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

// 获取当前显示的搜索数据
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

// 获取当前显示的主页数据
const getCurrentHomepageDisplayData = () => {
  if (currentHomepageSortColumn && currentHomepageSortOrder !== 0) {
    // 如果有排序，返回排序后的数据
    return [...originalHomepageData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (currentHomepageSortColumn === "timestamp") {
        aValue = new Date(a[currentHomepageSortColumn]).getTime();
        bValue = new Date(b[currentHomepageSortColumn]).getTime();
      } else {
        aValue = a[currentHomepageSortColumn] || 0;
        bValue = b[currentHomepageSortColumn] || 0;
      }

      return currentHomepageSortOrder === 1 ? aValue - bValue : bValue - aValue;
    });
  }
  // 如果没有排序，返回原始数据
  return originalHomepageData;
};

// 获取当前显示的抖音搜索数据
const getCurrentDouyinSearchDisplayData = () => {
  if (currentDouyinSearchSortColumn && currentDouyinSearchSortOrder !== 0) {
    // 如果有排序，返回排序后的数据
    return [...originalDouyinSearchData].sort((a, b) => {
      let aValue, bValue;

      // 根据不同列类型获取对应的值
      if (currentDouyinSearchSortColumn === "timestamp") {
        aValue = new Date(a[currentDouyinSearchSortColumn]).getTime();
        bValue = new Date(b[currentDouyinSearchSortColumn]).getTime();
      } else {
        aValue = a[currentDouyinSearchSortColumn] || 0;
        bValue = b[currentDouyinSearchSortColumn] || 0;
      }

      return currentDouyinSearchSortOrder === 1
        ? aValue - bValue
        : bValue - aValue;
    });
  }
  // 如果没有排序，返回原始数据
  return originalDouyinSearchData;
};

// 将主页数据转换为CSV格式
const convertHomepageToCSV = (data) => {
  // CSV表头，移除评论数、分享数和收藏数
  const headers = ["标题", "链接", "类型", "作者", "昵称", "点赞数", "时间戳"];

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
      new Date(item.timestamp).toLocaleString(),
    ];
  });

  // 组合表头和数据行
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// 将抖音搜索数据转换为CSV格式
const convertDouyinSearchToCSV = (data) => {
  // CSV表头
  const headers = [
    "视频描述",
    "抖音链接",
    "作者昵称",
    "作者主页",
    "视频地址",
    "点赞数",
    "收藏数",
    "分享数",
    "评论数",
    "时间戳",
  ];

  // 转换数据行
  const rows = data.map((item) => {
    return [
      item.desc || "",
      item.douyin_url || "",
      item.nickname || "",
      item.author_url || "",
      item.video_url || "",
      item.digg_count || 0,
      item.collect_count || 0,
      item.share_count || 0,
      item.comment_count || 0,
      new Date(item.timestamp).toLocaleString(),
    ];
  });

  // 组合表头和数据行
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// 导出搜索数据
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

// 导出主页数据
const exportHomepageData = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentHomepageDisplayData();
    if (data.length === 0) {
      document.getElementById("homepageStatus").textContent = "暂无数据可导出";
      return;
    }

    // 转换为CSV格式
    const csvContent = convertHomepageToCSV(data);

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
      filename: `xhs-homepage-${timestamp}.csv`,
      saveAs: true,
    });

    document.getElementById("homepageStatus").textContent = "数据导出成功！";
  } catch (error) {
    document.getElementById("homepageStatus").textContent =
      "导出失败：" + error.message;
  }
};

// 导出搜索数据为TXT
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

// 导出主页数据为TXT
const exportHomepageTXT = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentHomepageDisplayData();
    if (data.length === 0) {
      document.getElementById("homepageStatus").textContent = "暂无数据可导出";
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
      filename: `xhs-homepage-links-${timestamp}.txt`,
      saveAs: true,
    });

    document.getElementById("homepageStatus").textContent = "链接导出成功！";
  } catch (error) {
    document.getElementById("homepageStatus").textContent =
      "导出失败：" + error.message;
  }
};

// 导出抖音搜索数据
const exportDouyinSearchData = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentDouyinSearchDisplayData();
    if (data.length === 0) {
      document.getElementById("douyinSearchStatus").textContent =
        "暂无数据可导出";
      return;
    }

    // 转换为CSV格式
    const csvContent = convertDouyinSearchToCSV(data);

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
      filename: `douyin-search-${timestamp}.csv`,
      saveAs: true,
    });

    document.getElementById("douyinSearchStatus").textContent =
      "数据导出成功！";
  } catch (error) {
    document.getElementById("douyinSearchStatus").textContent =
      "导出失败：" + error.message;
  }
};

// 导出抖音搜索数据为TXT
const exportDouyinUrl = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentDouyinSearchDisplayData();
    if (data.length === 0) {
      document.getElementById("douyinSearchStatus").textContent =
        "暂无数据可导出";
      return;
    }

    // 转换为TXT格式 - 只导出抖音链接
    const txtContent = data.map((item) => item.douyin_url).join("\n");

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
      filename: `douyin-links-${timestamp}.txt`,
      saveAs: true,
    });

    document.getElementById("douyinSearchStatus").textContent =
      "链接导出成功！";
  } catch (error) {
    document.getElementById("douyinSearchStatus").textContent =
      "导出失败：" + error.message;
  }
};

// 导出抖音视频链接
const exportDouyinVideoUrl = async () => {
  try {
    // 使用当前显示的数据顺序
    const data = getCurrentDouyinSearchDisplayData();
    if (data.length === 0) {
      document.getElementById("douyinSearchStatus").textContent =
        "暂无数据可导出";
      return;
    }

    // 转换为TXT格式 - 只导出抖音链接
    const txtContent = data.map((item) => item.video_url).join("\n");

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
      filename: `douyin-video-links-${timestamp}.txt`,
      saveAs: true,
    });

    document.getElementById("douyinSearchStatus").textContent =
      "链接导出成功！";
  } catch (error) {
    document.getElementById("douyinSearchStatus").textContent =
      "导出失败：" + error.message;
  }
};

// 重置搜索排序状态
const resetSortState = () => {
  currentSortColumn = null;
  currentSortOrder = 0;
  updateSortIndicators("dataTable");
};

// 重置主页排序状态
const resetHomepageSortState = () => {
  currentHomepageSortColumn = null;
  currentHomepageSortOrder = 0;
  updateSortIndicators("homepageTable");
};

// 重置抖音搜索排序状态
const resetDouyinSearchSortState = () => {
  currentDouyinSearchSortColumn = null;
  currentDouyinSearchSortOrder = 0;
  updateSortIndicators("douyinSearchTable");
};

// 刷新搜索数据
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

// 刷新主页数据
const refreshHomepageData = async () => {
  document.getElementById("homepageStatus").textContent = "正在刷新...";
  try {
    const data = await getAllHomepageData();
    if (data.length === 0) {
      document.getElementById("homepageStatus").textContent = "暂无数据";
      document.getElementById("homepageBody").innerHTML = "";
      return;
    }
    originalHomepageData = data;
    // 重置排序状态
    resetHomepageSortState();
    // 使用原始数据顺序渲染
    renderHomepageData(data);
    document.getElementById(
      "homepageStatus"
    ).textContent = `共 ${data.length} 条数据`;
  } catch (error) {
    document.getElementById("homepageStatus").textContent =
      "刷新失败：" + error.message;
  }
};

// 刷新抖音搜索数据
const refreshDouyinSearchData = async () => {
  document.getElementById("douyinSearchStatus").textContent = "正在刷新...";
  try {
    const data = await getAllDouyinSearchData();
    if (data.length === 0) {
      document.getElementById("douyinSearchStatus").textContent = "暂无数据";
      document.getElementById("douyinSearchBody").innerHTML = "";
      return;
    }
    originalDouyinSearchData = data;
    // 重置排序状态
    resetDouyinSearchSortState();
    // 使用原始数据顺序渲染
    renderDouyinSearchData(data);
    document.getElementById(
      "douyinSearchStatus"
    ).textContent = `共 ${data.length} 条数据`;
  } catch (error) {
    document.getElementById("douyinSearchStatus").textContent =
      "刷新失败：" + error.message;
  }
};

// 清除搜索数据
const clearData = async () => {
  if (!confirm("确定要清除所有搜索数据吗？此操作不可恢复！")) {
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

// 清除主页数据
const clearHomepageData = async () => {
  if (!confirm("确定要清除所有主页数据吗？此操作不可恢复！")) {
    return;
  }

  try {
    await clearAllHomepageData();
    // 重置排序状态
    resetHomepageSortState();
    document.getElementById("homepageStatus").textContent = "数据已清除！";
    document.getElementById("homepageBody").innerHTML = "";
  } catch (error) {
    document.getElementById("homepageStatus").textContent =
      "清除失败：" + error.message;
  }
};

// 清除抖音搜索数据
const clearDouyinSearchData = async () => {
  if (!confirm("确定要清除所有抖音搜索数据吗？此操作不可恢复！")) {
    return;
  }

  try {
    await clearAllDouyinSearchData();
    // 重置排序状态
    resetDouyinSearchSortState();
    document.getElementById("douyinSearchStatus").textContent = "数据已清除！";
    document.getElementById("douyinSearchBody").innerHTML = "";
  } catch (error) {
    document.getElementById("douyinSearchStatus").textContent =
      "清除失败：" + error.message;
  }
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
  } else if (tabId === "douyin-search-tab") {
    document.getElementById("douyin-search-panel").classList.add("active");
  }
};

// 初始化页面
const initPage = async () => {
  try {
    // 加载搜索数据
    const data = await getAllData();
    if (data.length === 0) {
      document.getElementById("status").textContent = "暂无数据";
    } else {
      originalData = data;
      // 初始化时确保排序状态为重置状态
      resetSortState();
      renderData(data);
      document.getElementById(
        "status"
      ).textContent = `共 ${data.length} 条数据`;
    }

    // 加载主页数据
    const homepageData = await getAllHomepageData();
    if (homepageData.length === 0) {
      document.getElementById("homepageStatus").textContent = "暂无数据";
    } else {
      originalHomepageData = homepageData;
      // 初始化时确保排序状态为重置状态
      resetHomepageSortState();
      renderHomepageData(homepageData);
      document.getElementById(
        "homepageStatus"
      ).textContent = `共 ${homepageData.length} 条数据`;
    }

    // 加载抖音搜索数据
    const douyinSearchData = await getAllDouyinSearchData();
    if (douyinSearchData.length === 0) {
      document.getElementById("douyinSearchStatus").textContent = "暂无数据";
    } else {
      originalDouyinSearchData = douyinSearchData;
      // 初始化时确保排序状态为重置状态
      resetDouyinSearchSortState();
      renderDouyinSearchData(douyinSearchData);
      document.getElementById(
        "douyinSearchStatus"
      ).textContent = `共 ${douyinSearchData.length} 条数据`;
    }
  } catch (error) {
    document.getElementById("status").textContent =
      "加载失败：" + error.message;
    document.getElementById("homepageStatus").textContent =
      "加载失败：" + error.message;
    document.getElementById("douyinSearchStatus").textContent =
      "加载失败：" + error.message;
  }
};

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  initPage();

  // 搜索数据按钮事件
  document.getElementById("refreshData").addEventListener("click", refreshData);
  document.getElementById("exportData").addEventListener("click", exportData);
  document.getElementById("exportTXT").addEventListener("click", exportTXT);
  document.getElementById("clearData").addEventListener("click", clearData);

  // 主页数据按钮事件
  document
    .getElementById("refreshHomepageData")
    .addEventListener("click", refreshHomepageData);
  document
    .getElementById("exportHomepageData")
    .addEventListener("click", exportHomepageData);
  document
    .getElementById("exportHomepageTXT")
    .addEventListener("click", exportHomepageTXT);
  document
    .getElementById("clearHomepageData")
    .addEventListener("click", clearHomepageData);

  // 抖音搜索数据按钮事件
  document
    .getElementById("refreshDouyinSearchData")
    .addEventListener("click", refreshDouyinSearchData);
  document
    .getElementById("exportDouyinSearchData")
    .addEventListener("click", exportDouyinSearchData);
  document
    .getElementById("exportDouyinUrl")
    .addEventListener("click", exportDouyinUrl);
  document
    .getElementById("exportDouyinVideoUrl")
    .addEventListener("click", exportDouyinVideoUrl);
  document
    .getElementById("clearDouyinSearchData")
    .addEventListener("click", clearDouyinSearchData);

  // 侧边栏切换事件
  document
    .getElementById("search-tab")
    .addEventListener("click", () => switchTab("search-tab"));
  document
    .getElementById("homepage-tab")
    .addEventListener("click", () => switchTab("homepage-tab"));
  document
    .getElementById("douyin-search-tab")
    .addEventListener("click", () => switchTab("douyin-search-tab"));

  // 添加表头点击事件 - 搜索数据
  const headers = document.querySelectorAll("#dataTable th");
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

  // 添加表头点击事件 - 主页数据
  const homepageHeaders = document.querySelectorAll("#homepageTable th");
  homepageHeaders.forEach((header) => {
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
      header.addEventListener("click", () =>
        sortHomepageData(columnMapping[column])
      );
    }
  });

  // 添加表头点击事件 - 抖音搜索数据
  const douyinSearchHeaders = document.querySelectorAll(
    "#douyinSearchTable th"
  );
  douyinSearchHeaders.forEach((header) => {
    const column = header.textContent.trim();
    // 定义可排序列的映射关系
    const columnMapping = {
      点赞数: "digg_count",
      收藏数: "collect_count",
      分享数: "share_count",
      评论数: "comment_count",
      时间戳: "timestamp",
    };

    // 如果是可排序的列，添加排序功能
    if (columnMapping[column]) {
      header.setAttribute("data-column", columnMapping[column]);
      header.style.cursor = "pointer";
      header.addEventListener("click", () =>
        sortDouyinSearchData(columnMapping[column])
      );
    }
  });
});
