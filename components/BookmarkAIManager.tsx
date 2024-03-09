import { Add } from "@mui/icons-material"
import {
  Chip,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemText,
  TextField
} from "@mui/material"
import React, { useEffect, useState } from "react"

const BookmarksComponent = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [searchText, setSearchText] = useState("")
  const [searchTags, setSearchTags] = useState([]);

  useEffect(() => {
    // 从 chrome.storage.local 获取存储的书签数据
    chrome.storage.local.get(["bookmarks"], (result) => {
      if (result.bookmarks) {
        const sortedBookmarks = sortBookmarksByDate(result.bookmarks)
        setBookmarks(
          sortedBookmarks.map((bookmark) => ({ ...bookmark, newTag: "" }))
        )
      } else {
        // 如果没有存储的书签数据，则从 chrome.bookmarks API 获取
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          const flatBookmarks = flattenBookmarks(bookmarkTreeNodes).map(
            (bookmark) => ({ ...bookmark, newTag: "" })
          )
          const sortedBookmarks = sortBookmarksByDate(flatBookmarks)
          setBookmarks(sortedBookmarks)
          // 将获取的书签数据存储到 chrome.storage.local
          chrome.storage.local.set({ bookmarks: sortedBookmarks })
        })
      }
    })
  }, [])

  const sortBookmarksByDate = (bookmarks) => {
    return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded) // Sort by date in descending order
  }

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
  }

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);

    // // 检查是否输入了 tag:xx 格式的文本
    // if (value.startsWith('tag:')) {
    //   const tag = value.slice(4).trim();
    //   if (tag && !searchTags.includes(tag)) {
    //     setSearchTags([...searchTags, tag]);
    //     setSearchText(''); // 清空搜索框
    //   }
    // }
  }

  const handleNewTagChange = (id, event) => {
    const updatedBookmarks = bookmarks.map((bookmark) => {
      if (bookmark.id === id) {
        return { ...bookmark, newTag: event.target.value }
      }
      return bookmark
    })
    setBookmarks(updatedBookmarks)
  }

  const handleAddTag = (id) => {
    const updatedBookmarks = bookmarks.map((bookmark) => {
      if (
        bookmark.id === id &&
        bookmark.newTag &&
        !bookmark.tags.includes(bookmark.newTag)
      ) {
        const updatedTags = [...bookmark.tags, bookmark.newTag]
        return { ...bookmark, tags: updatedTags, newTag: "" }
      }
      return bookmark
    })
    setBookmarks(updatedBookmarks)
    // 更新 chrome.storage.local 中的书签数据
    chrome.storage.local.set({ bookmarks: updatedBookmarks })
  }

  const handleRemoveTag = (id, tagToRemove) => {
    const updatedBookmarks = bookmarks.map((bookmark) => {
      if (bookmark.id === id) {
        const updatedTags = bookmark.tags.filter((tag) => tag !== tagToRemove)
        return { ...bookmark, tags: updatedTags }
      }
      return bookmark
    })
    setBookmarks(updatedBookmarks)
    // 更新 chrome.storage.local 中的书签数据
    chrome.storage.local.set({ bookmarks: updatedBookmarks })
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    // 检查书签标题是否包含搜索文本
    const matchesSearchText = searchText === '' || bookmark.title.toLowerCase().includes(searchText.toLowerCase());
    // 检查书签的标签是否包含所有搜索标签
    const matchesTags = searchTags.length === 0 || searchTags.every(tag => bookmark.tags.includes(tag));
    return matchesSearchText && matchesTags;
  })

  // 以天为单位分组书签
  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const date = new Date(bookmark.dateAdded).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(bookmark)
    return acc
  }, {})

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && searchText.startsWith('tag:')) {
        const tag = searchText.split(':')[1].trim();
        if (tag && !searchTags.includes(tag)) {
            setSearchTags([...searchTags, tag]);
        }
        setSearchText('');
    }

    if (event.key === 'Backspace' && searchText === '' && searchTags.length > 0) {
        // 当搜索框为空并且按下退格键时，移除最后一个标签
        const newTags = searchTags.slice(0, -1);
        setSearchTags(newTags);
    }
  };

  const handleRemoveSearchTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };


  return (
    <div>
      <TextField
        label="Search Bookmarks"
        variant="outlined"
        value={searchText}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        fullWidth
        margin="normal"
        InputProps={{
            startAdornment: searchTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveSearchTag(tag)}
                style={{ margin: '2px' }}
              />
            ))
        }}
      />
      <List>
        {Object.keys(groupedBookmarks).map((date) => (
          <React.Fragment key={date}>
            <ListItem>
              <ListItemText primary={date} />
            </ListItem>
            {groupedBookmarks[date].map((bookmark) => (
              <ListItem key={bookmark.id}>
                <ListItemText
                  primary={bookmark.title}
                  secondary={
                    <>
                      {/* <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    {bookmark.url}
                  </a> */}
                      <div>
                        {bookmark.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleRemoveTag(bookmark.id, tag)}
                            style={{ margin: "5px" }}
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
                    if (event.key === "Enter") handleAddTag(bookmark.id)
                  }}
                  style={{ marginRight: "5px" }}
                />
                <IconButton onClick={() => handleAddTag(bookmark.id)}>
                  <Add />
                </IconButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}

export default BookmarksComponent
