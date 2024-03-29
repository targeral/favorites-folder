import BookmarkIcon from "@mui/icons-material/Bookmark"
import {
  Alert,
  Avatar,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField
} from "@mui/material"
import type { IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import React, { useCallback, useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  BookmarkUpdateRequestBody,
  BookmarkUpdateResponseBody
} from "~background/messages/bookmark/update"
import { getStorage, StorageKeyHash } from "~storage/index"

import { BookmarkEditor, type OnTagsUpdate } from "./BookmarkEditor"

// import moment from 'moment';

const instance = getStorage()

const BookmarkManager = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [tagsFilter, setTagsFilter] = useState<ITagItem[]>([])
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([])
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertContent, setAlertContent] = useState<string>("")

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
        const { bookmarks } = await gs.getBookmarks()
        console.info("bookmarkTreeNodes", bookmarks)
        setBookmarks(bookmarks)
      }
    }
    main()
    // flattenBookmarks(mockBookmarksData);
  }, [token, repo, owner, email])

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
    const value = event.target.value
    setSearchTerm(value)

    if (value.startsWith("tag:")) {
      const tag = value.split(":")[1]
      if (tag && !tagsFilter.includes(tag)) {
        setTagsFilter([...tagsFilter, tag])
      }
    }
  }

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      setSearchTerm("")
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (
      tagsFilter.length > 0 &&
      !tagsFilter.every((tag) => bookmark.tags.includes(tag))
    ) {
      return false
    }
    return bookmark.title.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleUpdateBookmark = useCallback<OnTagsUpdate>(
    async (updatedBookmark) => {
      console.info("update", updatedBookmark)
      const result = await sendToBackground<
        BookmarkUpdateRequestBody,
        BookmarkUpdateResponseBody
      >({
        name: "bookmark/update",
        body: {
          updatedBookmark
        }
      })
      if (result.status === "success") {
        setAlertContent("更新成功")
      } else {
        setAlertContent("更新失败")
      }
      setAlertOpen(true)
    },
    []
  )

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

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
        {tagsFilter.map((tag) => (
          <Chip key={tag.name} label={tag.name} />
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
              secondary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {bookmark.tags.slice(0, 5).map((tag) => (
                    <Chip key={tag.name} label={tag.name} />
                  ))}
                  {bookmark.tags.length > 5
                    ? `+${bookmark.tags.length - 5}`
                    : null}
                  <BookmarkEditor
                    bookmark={bookmark}
                    onTagsUpdated={handleUpdateBookmark}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alertOpen}
        autoHideDuration={2000}
        onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose}>
          {alertContent}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default BookmarkManager
