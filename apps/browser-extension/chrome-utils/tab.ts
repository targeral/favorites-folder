export const getCurrentActiveTab = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    // 获取当前活动标签页的URL
    return tabs[0];
}

export const checkIsNewTab = (tab: chrome.tabs.Tab) => {
    const checkString = 'newtab';
    if (!tab.url) {
        // have not url? Maybe is folder
        return true;
    }

    return tab.url.includes(checkString);
}