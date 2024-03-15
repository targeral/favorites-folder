import type { PlasmoMessaging } from "@plasmohq/messaging"
const flattenBookmarks = (nodes, parentTitle = "") => {
    let flatList = []
    nodes.forEach((node) => {
      if (node.children) {
        flatList = flatList.concat(flattenBookmarks(node.children, node.title))
      } else if (node.url) {
        flatList.push({ ...node, tags: parentTitle ? [parentTitle] : [] })
      }
    })
    return flatList
};

const sortBookmarksByDate = (bookmarks) => {
    return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded) // Sort by date in descending order
};

const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
    const bookmarkTreeNodes = await chrome.bookmarks.getTree();
    const flatBookmarks = flattenBookmarks(bookmarkTreeNodes).map(
        (bookmark) => ({ ...bookmark, newTag: "" })
    );
    const sortedBookmarks = sortBookmarksByDate(flatBookmarks);

    res.send({ bookmarks: sortedBookmarks });
}
 
export default handler