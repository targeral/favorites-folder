import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as bookmark from '~chrome-utils/bookmark';
import * as tab from '~chrome-utils/tab';

// 当 popup 激活时，插件图标变为另一张图片
const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
    console.info('popup open');
    const currentTab = await tab.getCurrentActiveTab();
    await bookmark.createBookmark(currentTab);
    // 添加成功后，更改图标为激活状态
    await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: currentTab.id })
    res.send({ success: true });
}
 
export default handler