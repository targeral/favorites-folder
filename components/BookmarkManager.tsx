import { useCallback, useState } from 'react';

export interface BookmarkManagerProps {
  bookmarksTrees: chrome.bookmarks.BookmarkTreeNode[];
}

export interface Bookmark { title: string; url: string };

export interface BookmarkManagerState {
    bookmarks: {title: string; url: string }[];
    title: '',
    url: ''
}

export const ListItem = (props: {node: chrome.bookmarks.BookmarkTreeNode}) => {
    const { node } = props;

    return (
        <>
            { node.children ? (
                <div>
                    <div>【{node.title}】</div>
                    {
                        node.children.map(
                            nodeItem => <ListItem node={nodeItem}></ListItem>
                        )
                    }
                </div>
            ) : (
                <div>
                    - <a href={node.url} target='_blank'>{node.title}</a>
                </div>
            )}
        </>
    );
}

export const BookmarkManager = (props: BookmarkManagerProps) => {
    const { bookmarksTrees } = props;
    // const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    // const [title, setTitle] = useState<string>('');
    // const [url, setUrl] = useState<string>('');

    // const handleTitleChange = useCallback((event) => {
    //     setTitle(event.target.value)
    // }, []);
    // const handleUrlChange = useCallback((event) => {
    //     setUrl(event.target.value);
    // }, []);
    // const addBookmark = useCallback(() => {
    //     setBookmarks([
    //         ...bookmarks,
    //         {
    //             title,
    //             url
    //         }
    //     ])
    // }, [title, url]);

    return (
        <div>
        <h1>Bookmark Manager</h1>
        {
            bookmarksTrees.length > 0 ? bookmarksTrees[0].children.map(node => (
                <ListItem key={node.id} node={node}></ListItem>
            )) : 'empty'
        }
      </div>
    );
}