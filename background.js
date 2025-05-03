import { saveData, saveHomepageData } from "./db.js";

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // 首次安装时打开about页面
    chrome.tabs.create({ url: "about.html" });
  }
});

// 保存搜索数据到IndexedDB
const saveToIndexedDB = async (notesData) => {
  const { items } = notesData;
  for (const item of items) {
    const { id, note_card, xsec_token, model_type } = item;
    if (model_type === "note") {
      const { display_title, type, user, interact_info } = note_card;
      const { collected_count, comment_count, liked_count, shared_count } =
        interact_info;
      const { nickname, user_id } = user;
      await saveData({
        id,
        display_title: display_title || "",
        type,
        user_id,
        nickname,
        xsec_token,
        collected_count,
        comment_count,
        liked_count,
        shared_count,
        timestamp: Date.now(),
      });
    }
  }
  console.log("搜索数据已保存到IndexedDB");
};

// 保存主页数据到IndexedDB
const saveHomepageToIndexedDB = async (notesData) => {
  const { notes } = notesData;
  for (const note of notes) {
    const { note_id, xsec_token, type, display_title, user, interact_info } =
      note;

    // 检查并提取点赞数量，可能是字符串格式
    const liked_count = interact_info.liked_count
      ? parseInt(interact_info.liked_count)
      : 0;

    // 用户信息处理，确保获取正确的字段
    const { nickname, user_id } = user;

    // 由于主页API返回中不包含评论数、收藏数和分享数，设置为0或默认值
    const comment_count = 0;
    const collected_count = 0;
    const shared_count = 0;

    await saveHomepageData({
      id: note_id,
      display_title: display_title || "",
      type,
      user_id,
      nickname,
      xsec_token,
      collected_count,
      comment_count,
      liked_count,
      shared_count,
      timestamp: Date.now(),
    });
  }
  console.log("主页数据已保存到IndexedDB");
};

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEARCH_RESULT") {
    try {
      const responseData = JSON.parse(message.responseText);
      console.log("background.js收到搜索消息:", responseData);
      const { code, data: notesData } = responseData;
      if (code === 0) {
        saveToIndexedDB(notesData);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error("解析搜索响应数据失败:", error);
      sendResponse({ success: false });
    }
    return true;
  }

  if (message.type === "HOMEPAGE_RESULT") {
    try {
      const responseData = JSON.parse(message.responseText);
      console.log("background.js收到主页消息:", responseData);
      const { code, data: notesData } = responseData;
      if (code === 0) {
        saveHomepageToIndexedDB(notesData);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error("解析主页响应数据失败:", error);
      sendResponse({ success: false });
    }
    return true;
  }
});
