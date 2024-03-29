import BookmarkIcon from "@mui/icons-material/Bookmark"
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  type AutocompleteInputChangeReason
} from "@mui/material"
import type { IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  BookmarkUpdateRequestBody,
  BookmarkUpdateResponseBody
} from "~background/messages/bookmark/update"
import { getStorage, StorageKeyHash } from "~storage/index"

import { BookmarkEditor, type OnTagsUpdate } from "./BookmarkEditor"

const instance = getStorage()

const BookmarkManager = () => {
  const [searchText, setSearchText] = useState<string>("")
  const [searchTags, setSearchTags] = useState<ITagItem[]>([])
  const [avaliableTags, setAvailableTags] = useState<ITagItem[]>([])
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([])
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertContent, setAlertContent] = useState<string>("")
  const [loading, setLoading] = useState(true)

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
        setBookmarks(bookmarks)
        setLoading(false)

        const availableTags = new Map<string, ITagItem>()
        for (const bookmark of bookmarks) {
          for (const tag of bookmark.tags) {
            availableTags.set(tag.name, tag)
          }
        }
        setAvailableTags(Array.from(availableTags.values()))
      }
    }
    main()
    // flattenBookmarks(mockBookmarksData);
  }, [token, repo, owner, email])

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchText.startsWith("tag:")) {
      const tagName = searchText.split(":")[1].trim()
      if (
        tagName &&
        !searchTags.find((searchTag) => searchTag.name === tagName)
      ) {
        setSearchTags([...searchTags, { name: tagName, source: "SYSTEM" }])
      }
      setSearchText("")
    }

    if (
      event.key === "Backspace" &&
      searchText === "" &&
      searchTags.length > 0
    ) {
      // 当搜索框为空并且按下退格键时，移除最后一个标签
      const newTags = searchTags.slice(0, -1)
      setSearchTags(newTags)
    }
  }

  const handleRemoveSearchTag = (tagToRemove: ITagItem) => {
    setSearchTags(searchTags.filter((tag) => tag.name !== tagToRemove.name))
  }

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

  const handleSearchChange = (
    _,
    newValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    if (reason === "input" || reason === "clear") {
      setSearchText(newValue)
    }
  }

  const handleSearchTagSelect = (event, newValue: string) => {
    if (newValue && newValue.startsWith("tag:")) {
      const tagName = newValue.split(":")[1]
      if (
        tagName &&
        !searchTags.find((searchTag) => searchTag.name === tagName)
      ) {
        setSearchTags([...searchTags, { name: tagName, source: "SYSTEM" }])
        event.preventDefault()
        setSearchText("")
      }
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    // 检查书签标题是否包含搜索文本
    const matchesSearchText =
      searchText === "" ||
      bookmark.title.toLowerCase().includes(searchText.toLowerCase())
    // 检查书签的标签是否包含所有搜索标签
    const matchesTags =
      searchTags.length === 0 ||
      searchTags.every((searchTag) =>
        bookmark.tags.find((tag) => tag.name === searchTag.name)
      )
    return matchesSearchText && matchesTags
  })

  const handleUpdateBookmark = useCallback<OnTagsUpdate>(
    async (updatedBookmark) => {
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
        const index = bookmarks.findIndex(
          (bookmark) => bookmark.id === updatedBookmark.id
        )
        if (index !== -1) {
          const updatedBookmarks = [...bookmarks]
          updatedBookmarks[index] = updatedBookmark
          setBookmarks(updatedBookmarks)
        }
      } else {
        setAlertContent("更新失败")
      }
      setAlertOpen(true)
    },
    [bookmarks]
  )

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      <Autocomplete
        freeSolo
        options={avaliableTags.map((tag) => `tag:${tag.name}`)}
        inputValue={searchText}
        onInputChange={handleSearchChange}
        onChange={handleSearchTagSelect}
        onKeyDown={handleSearchKeyDown}
        filterOptions={(options, { inputValue }) => {
          if (inputValue.startsWith("tag:")) {
            return options
          }

          return []
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Bookmarks"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              ...params.InputProps,
              startAdornment: searchTags.map((tag) => (
                <Chip
                  key={tag.name}
                  label={tag.name}
                  onDelete={() => handleRemoveSearchTag(tag)}
                  style={{ margin: "2px" }}
                />
              ))
            }}
          />
        )}
      />
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
        <Alert onClose={handleAlertClose}>{alertContent}</Alert>
      </Snackbar>
    </div>
  )
}

export default BookmarkManager
