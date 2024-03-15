import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as bookmark from '~chrome-utils/bookmark';

// 当 popup 激活时，插件图标变为另一张图片
const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
    console.info('popup open');
    
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        for (const tab of tabs) {
            const isBookmarked = await bookmark.checkIfBookmarked(tab.url);
            console.info('click', isBookmarked);
            if (!isBookmarked) {
                await bookmark.createBookmark(tab);
                // 添加成功后，更改图标为激活状态
                await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: tab.id })
            }
        }
    });

    res.send({ success: true });
}
 
export default handler