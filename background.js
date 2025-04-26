import { saveData } from "./db.js";

// 保存数据到IndexedDB
const saveToIndexedDB = async (notesData) => {
  const { items } = notesData;
  for (const item of items) {
    const { id, note_card, xsec_token, model_type } = item;
    if (model_type === "note") {
      const { display_title, type, user } = note_card;
      const { nickname, user_id } = user;
      await saveData({
        id,
        display_title: display_title || "",
        type,
        user_id,
        nickname,
        xsec_token,
        timestamp: Date.now(),
      });
    }
  }
  console.log("数据已保存到IndexedDB");
};

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEARCH_RESULT") {
    try {
      const responseData = JSON.parse(message.responseText);
      console.log("background.js收到消息:", responseData);
      const { code, data: notesData } = responseData;
      if (code === 0) {
        saveToIndexedDB(notesData);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error("解析响应数据失败:", error);
      sendResponse({ success: false });
    }
    return true;
  }
});
