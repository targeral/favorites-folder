export const checkIfBookmarked = async (url: string): Promise<boolean> => {
    const results = await chrome.bookmarks.search({ url });
    return results.length > 0;
}

export const createBookmark = async (tab: chrome.tabs.Tab) => {
    await chrome.bookmarks.create({title: tab.title, url: tab.url});
}

export const findBookmarkByUrl = async (url: string): Promise<chrome.bookmarks.BookmarkTreeNode | null> => {
    // 查找当前页面的书签
    const bookmarkItems = await chrome.bookmarks.search({ url });
    return bookmarkItems.length > 0 ? bookmarkItems[0] : null;
}

export const removeBookmark = async (url: string) => {
    const isBookmarked = await checkIfBookmarked(url);
    
    if (!isBookmarked) {
        return;
    }

    const bookmark = await findBookmarkByUrl(url);

    await chrome.bookmarks.remove(bookmark.id);
    if (chrome.runtime.lastError) {
        return {
            message: undefined,
            error: `Error removing bookmark: ${chrome.runtime.lastError}`,
        };
    } else {
        return {
            message: 'Bookmark removed successfully!',
            error: undefined,
        };
    }
}

export const createBookmarkForCurrentTab = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0]; 
    await createBookmark(currentTab);
}