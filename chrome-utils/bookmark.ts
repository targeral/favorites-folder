export const checkIfBookmarked = async (url: string): Promise<boolean> => {
    const results = await chrome.bookmarks.search({ url });
    return results.length > 0;
}

export const createBookmark = async (tab: chrome.tabs.Tab) => {
    await chrome.bookmarks.create({title: tab.title, url: tab.url});
}