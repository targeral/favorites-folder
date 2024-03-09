import { useEffect, useState } from "react"
import { BookmarkManager } from './components/BookmarkManager';
import BookmarksComponent from './components/BookmarkAIManager';

function IndexPopup() {
  // const [bookmarksTreeNode, setBookmarksTreeNode] = useState<chrome.bookmarks.BookmarkTreeNode[]>([])

  // chrome.runtime.sendMessage({popupOpen: true});

  // useEffect(() => {
  //   const main = async () => {
  //     const results = await chrome.bookmarks.getTree();
  //     setBookmarksTreeNode(results);
  //     console.info('results', results);
  //   };
  //   main();
  // }, []);

  return (
    <div
      style={{
        padding: 16,
        width: "400px"
      }}>
      {/* <BookmarkManager bookmarksTrees={bookmarksTreeNode}></BookmarkManager> */}
      <BookmarksComponent></BookmarksComponent>
    </div>
  )
}

export default IndexPopup
