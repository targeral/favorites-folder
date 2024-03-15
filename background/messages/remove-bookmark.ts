import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getCurrentActiveTab } from '~chrome-utils';
import * as bookmark from '~chrome-utils/bookmark';

const removeBookmark = async () => {
    const currentPageTab = await getCurrentActiveTab();
    const result = await bookmark.removeBookmark(currentPageTab.url);
    return result;
}
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const result = await removeBookmark();
    res.send(result);
}
 
export default handler