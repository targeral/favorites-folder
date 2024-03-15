import * as bookmark from '../chrome-utils/bookmark';

export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

// 更新图标
const updateIcon = async ({ active, tabId }: {active: boolean, tabId: number}) => {
  if (active) {
    await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId })
  } else {
    await chrome.action.setIcon({path: chrome.runtime.getURL("resources/icon-default.png"), tabId });
  }
}

// 初始化图标
const setIconByBookmarked = async (tab: chrome.tabs.Tab) => {
  if (!tab.url) {
    await updateIcon({ active: false, tabId: tab.id });
    return;
  }
  const isBookmarked = await bookmark.checkIfBookmarked(tab.url);
  await updateIcon({ active: isBookmarked, tabId: tab.id });
}

// 切换图标
const toggleIcon = async (tab: chrome.tabs.Tab) => {
  if (!tab.url) {
    await updateIcon({ active: false, tabId: tab.id });
    return;
  }
  const isBookmarked = await bookmark.checkIfBookmarked(tab.url);
  await updateIcon({ active: !isBookmarked, tabId: tab.id });
}

// 监听标签页更新事件，以便更新图标状态
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await setIconByBookmarked(tab);
  }
});

// 监听标签页激活事件，以便更新图标状态
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    await setIconByBookmarked(tab);
  });
});

// 监听书签移除事件，以便更新图标状态
chrome.bookmarks.onRemoved.addListener(function(id, removeInfo) {
  // 获取当前激活的标签页
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    console.info('remove tabs', tabs);
    if (tabs.length > 0) {
      let currentTab = tabs[0];
      // 更新当前激活的标签页图标
      await updateIcon({ active: false, tabId: currentTab.id });
    }
  });
});

// 如果扩展程序操作指定了在用户点击当前标签页时显示的弹出式窗口，则不会发送 action.onClicked 事件。
// chrome.action.onClicked.addListener(async (tab) => {
//   // 点击插件时触发的事件
//   const isBookmarked = await bookmark.checkIfBookmarked(tab.url);
//   console.info('click', isBookmarked);
//   if (!isBookmarked) {
//     await bookmark.createBookmark(tab);
//     // 添加成功后，更改图标为激活状态
//     await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: tab.id })
//   }

//   // TODO: Sends message about whether the current page is bookmarked to the popup
// });