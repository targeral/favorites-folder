import { useEffect, useState } from "react"
import Bookmark from './Bookmark';
import { sendToBackground } from "@plasmohq/messaging"

import './index.less';


function IndexPopup() {
  // const [bookmarksTreeNode, setBookmarksTreeNode] = useState<chrome.bookmarks.BookmarkTreeNode[]>([])

  // chrome.runtime.sendMessage({popupOpen: true});
  useEffect(() => {
    // chrome.runtime.sendMessage({ popupOpen: true });
    const main = async () => {
      await sendToBackground({ name: 'popup-open' });
    };
    main();
  }, []);

  // useEffect(() => {
  //   const main = async () => {
  //     const results = await chrome.bookmarks.getTree();
  //     setBookmarksTreeNode(results);
  //     console.info('results', results);
  //   };
  //   main();
  // }, []);

  return (
    <Bookmark></Bookmark>
  )
}

export default IndexPopup
