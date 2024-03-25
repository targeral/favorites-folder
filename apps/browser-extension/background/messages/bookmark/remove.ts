import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getCurrentActiveTab } from '~chrome-utils';
import * as bookmark from '~chrome-utils/bookmark';

export interface RequestBody {}
  
export interface ResponseBody {
    status: 'success' | 'fail';
    message?: string;
}

const removeBookmark = async () => {
    // TODO: add storage operations
    return {
        status: 'success',
    };
}
 
const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    const currentPageTab = await getCurrentActiveTab();
    await bookmark.removeBookmark(currentPageTab.url);
    const result = await removeBookmark();
    // TODO: remove data in storage
    res.send({ status: 'success' });
}
 
export default handler