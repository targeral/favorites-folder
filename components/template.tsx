
  import React, { useState, useEffect } from 'react';
import { TextField, Chip, List, ListItem, ListItemText, IconButton, Input } from '@mui/material';
import { Add } from '@mui/icons-material';

const BookmarksComponent = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    // 从 chrome.storage.local 获取存储的书签数据
    chrome.storage.local.get(['bookmarks'], (result) => {
      if (result.bookmarks) {
        setBookmarks(result.bookmarks.map(bookmark => ({ ...bookmark, newTag: '' })));
      } else {
        // 如果没有存储的书签数据，则从 chrome.bookmarks API 获取
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          const flatBookmarks = flattenBookmarks(bookmarkTreeNodes).map(bookmark => ({ ...bookmark, newTag: '' }));
          setBookmarks(flatBookmarks);
          // 将获取的书签数据存储到 chrome.storage.local
          chrome.storage.local.set({ bookmarks: flatBookmarks });
        });
      }
    });
  }, []);

  const flattenBookmarks = (nodes, parentTitle = '') => {
    let flatList = [];
    nodes.forEach(node => {
      if (node.children) {
        flatList = flatList.concat(flattenBookmarks(node.children, node.title));
      } else if (node.url) {
        flatList.push({ ...node, tags: parentTitle ? [parentTitle] : [] });
      }
    });
    return flatList;
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleNewTagChange = (id, event) => {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === id) {
        return { ...bookmark, newTag: event.target.value };
      }
      return bookmark;
    });
    setBookmarks(updatedBookmarks);
  };

  const handleAddTag = (id) => {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === id && bookmark.newTag && !bookmark.tags.includes(bookmark.newTag)) {
        const updatedTags = [...bookmark.tags, bookmark.newTag];
        return { ...bookmark, tags: updatedTags, newTag: '' };
      }
      return bookmark;
    });
    setBookmarks(updatedBookmarks);
    // 更新 chrome.storage.local 中的书签数据
    chrome.storage.local.set({ bookmarks: updatedBookmarks });
  };

  const handleRemoveTag = (id, tagToRemove) => {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === id) {
        const updatedTags = bookmark.tags.filter(tag => tag !== tagToRemove);
        return { ...bookmark, tags: updatedTags };
      }
      return bookmark;
    });
    setBookmarks(updatedBookmarks);
    // 更新 chrome.storage.local 中的书签数据
    chrome.storage.local.set({ bookmarks: updatedBookmarks });
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearchText = searchText === '' || bookmark.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags = tags.length === 0 || tags.some(tag => bookmark.tags.includes(tag));
    return matchesSearchText && matchesTags;
  });

  return (
    <div>
      <TextField
        label="Search Bookmarks"
        variant="outlined"
        value={searchText}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <List>
        {filteredBookmarks.map(bookmark => (
          <ListItem key={bookmark.id}>
            <ListItemText
              primary={bookmark.title}
              secondary={
                <>
                  {/* <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    {bookmark.url}
                  </a> */}
                  <div>
                    {bookmark.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(bookmark.id, tag)}
                        style={{ margin: '5px' }}
                      />
                    ))}
                  </div>
                </>
              }
            />
            <Input
              placeholder="Add tag"
              value={bookmark.newTag}
              onChange={(event) => handleNewTagChange(bookmark.id, event)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddTag(bookmark.id);
              }}
              style={{ marginRight: '5px' }}
            />
            <IconButton onClick={() => handleAddTag(bookmark.id)}>
              <Add />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default BookmarksComponent;
