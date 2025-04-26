// 初始化IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("XHSData", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// 获取所有数据
const getAllData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["searchResults"], "readonly");
    const store = transaction.objectStore("searchResults");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 清除所有数据
const clearAllData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["searchResults"], "readwrite");
    const store = transaction.objectStore("searchResults");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 将数据转换为CSV格式
const convertToCSV = (data) => {
  // CSV表头
  const headers = [
    "ID",
    "标题",
    "链接",
    "类型",
    "用户ID",
    "昵称",
    "Token",
    "时间戳",
  ];

  // 转换数据行
  const rows = data.map((item) => [
    item.id,
    item.display_title,
    `https://www.xiaohongshu.com/explore/${item.id}?xsec_token=${item.xsec_token}&xsec_source=pc_search&source=web_explore_feed`,
    item.type,
    item.user_id,
    item.nickname,
    item.xsec_token,
    new Date(item.timestamp).toLocaleString(),
  ]);

  // 组合表头和数据行
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

// 导出数据
const exportData = async () => {
  try {
    const data = await getAllData();

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
