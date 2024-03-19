import React, { useState, useEffect } from 'react';
import { TextField, Chip, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, StorageKeyHash } from "~storage/index"
import { GithubStorage } from "github-store"
import type { IBookmark, ITagItem } from 'api-types';
// import moment from 'moment';

const instance = getStorage()

const BookmarkManager = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tagsFilter, setTagsFilter] = useState<ITagItem[]>([]);
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);

  const [token, setToken] = useStorage<string>(
    {
      key: StorageKeyHash.TOKEN,
      instance
    },
    ""
  )
  const [repo, setRepo] = useStorage<string>(
    {
      key: StorageKeyHash.REPO,
      instance
    },
    ""
  )
  const [owner, setOwner] = useStorage<string>(
    {
      key: StorageKeyHash.OWNER,
      instance
    },
    ""
  )
  const [email, setEmail] = useStorage<string>(
    {
      key: StorageKeyHash.EMAIL,
      instance
    },
    ""
  )
  const [geminiApiKey, setGeminiApiKey] = useStorage<string>({
    key: StorageKeyHash.GEMINI_API_KEY,
    instance
  })

  useEffect(() => {
    // 由于安全限制，此处模拟从 background script 获取书签数据
    // 实际应使用 chrome.bookmarks.getTree
    const main = async () => {
        // const { bookmarks } = await sendToBackground({ name: 'get-bookmarks' });
      if (token && repo && owner && email) {
        const gs = new GithubStorage({
          token,
          repo,
          owner,
          email,
          storageFolder: "favorites",
          filename: "data.json",
          branch: "main"
        })
        const { bookmarks } = await gs.getBookmarks();
        console.info('bookmarkTreeNodes', bookmarks);
        setBookmarks(bookmarks);
      }
    };
    main();
    // flattenBookmarks(mockBookmarksData);
  }, [token, repo, owner, email]);

//   const flattenBookmarks = (bookmarksData, parentTitle = '') => {
//     let flatBookmarks = [];
//     for (const item of bookmarksData) {
//       if (item.url) {
//         flatBookmarks.push({ ...item, tags: [parentTitle] });
//       }
//       if (item.children) {
//         flatBookmarks = [...flatBookmarks, ...flattenBookmarks(item.children, item.title)];
//       }
//     }
//     setBookmarks(flatBookmarks);
//   };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.startsWith('tag:')) {
      const tag = value.split(':')[1];
      if (tag && !tagsFilter.includes(tag)) {
        setTagsFilter([...tagsFilter, tag]);
      }
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setSearchTerm('');
    }
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (tagsFilter.length > 0 && !tagsFilter.every(tag => bookmark.tags.includes(tag))) {
      return false;
    }
    return bookmark.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <TextField
        label="Search Bookmarks"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyPress={handleSearchKeyPress}
      />
      <div>
        {tagsFilter.map((tag, index) => (
          <Chip key={index} label={tag.name} />
        ))}
      </div>
      <List>
        {filteredBookmarks.map((bookmark, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <Avatar>
                <BookmarkIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={bookmark.title}
              secondary={bookmark.tags.map((tag, index) => (
                <Chip key={index} label={tag.name} />
              ))}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default BookmarkManager;
