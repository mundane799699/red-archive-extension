// 初始化IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("XHSData", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("searchResults")) {
        const store = db.createObjectStore("searchResults", {
          keyPath: "id",
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains("homepageResults")) {
        const store = db.createObjectStore("homepageResults", {
          keyPath: "id",
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

// 获取所有搜索数据
export const getAllData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["searchResults"], "readonly");
    const store = transaction.objectStore("searchResults");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 获取所有主页数据
export const getAllHomepageData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["homepageResults"], "readonly");
    const store = transaction.objectStore("homepageResults");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 清除所有搜索数据
export const clearAllData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["searchResults"], "readwrite");
    const store = transaction.objectStore("searchResults");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 清除所有主页数据
export const clearAllHomepageData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["homepageResults"], "readwrite");
    const store = transaction.objectStore("homepageResults");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 保存搜索数据
export const saveData = async (data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["searchResults"], "readwrite");
    const store = transaction.objectStore("searchResults");
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 保存主页数据
export const saveHomepageData = async (data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["homepageResults"], "readwrite");
    const store = transaction.objectStore("homepageResults");
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
