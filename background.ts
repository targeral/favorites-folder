export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)
chrome.action.onClicked.addListener(function (tab) {
  // 点击插件时触发的事件
  console.info('click')
  chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: tab.id })
})

// 当popup 出现时，插件图标变为另一张图片
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.popupOpen) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.action.setIcon({
            path:  chrome.runtime.getURL("resources/icon-active.png"),
            tabId: tabs[0].id
        })
    });
  } else {
    // chrome.browserAction.setIcon({
    //   path: "icon_active.png",
    //   tabId: sender.tab.id
    // })
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.info('changeInfo.url', changeInfo);
    console.info('tab.url', tab.url);
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("https://developer.chrome.com")) {
      // 当 URL 包含 http://example.com 时，设置插件图标为 a.png
      chrome.action.setIcon({path: chrome.runtime.getURL("resources/icon-active.png") });
    } else {
      // 其他情况设置插件图标为 b.png
      chrome.action.setIcon({path: chrome.runtime.getURL("resources/icon-default.png") });
    }
});