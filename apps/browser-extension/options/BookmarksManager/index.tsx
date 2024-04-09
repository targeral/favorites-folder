import BookmarkIcon from "@mui/icons-material/Bookmark"
import EditIcon from "@mui/icons-material/Edit"
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  type AutocompleteInputChangeReason
} from "@mui/material"
import { debounce } from "@mui/material/utils"
import type { IBookmark, ITagItem } from "api-types"
import Fuse from "fuse.js"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { sendToBackground } from "@plasmohq/messaging"

import type {
  GetBookmarksRequestBody,
  GetBookmarksResponseBody
} from "~background/messages/bookmark/get"
import type {
  GetBookmarksFromBrowserRequest,
  GetBookmarksFromBrowserResponse
} from "~background/messages/bookmark/get-from-browser"
import type {
  BookmarkUpdateRequestBody,
  BookmarkUpdateResponseBody
} from "~background/messages/bookmark/update"
import type {
  BookmarkBatchRequestBody,
  BookmarkBatchResponseBody,
  BookmarkRemoveRequestBody,
  BookmarkRemoveResponseBody,
  TagListRequestBody,
  TagListResponseBody,
  TagsGenerateRequestBody,
  TagsGenerateResponseBody
} from "~background/types"
import { getStorage, StorageServer, TagAIServer } from "~storage/index"
import { detectBrowser } from "~utils/browser"

import {
  InitDialog,
  type InitType,
  type OnGoToSettingPage
} from "../components/InitDialog"
import {
  BookmarkEditorDialog,
  type OnGenerateNewTags,
  type OnTagsUpdate
} from "./BookmarkEditor"

const instance = getStorage()
const browserType = detectBrowser()
const TAG_LIST_LIMIT = 1000

const BookmarkManager = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState<string>("")
  const [searchTags, setSearchTags] = useState<ITagItem[]>([])
  const [avaliableTags, setAvailableTags] = useState<ITagItem[]>([])
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([])
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertContent, setAlertContent] = useState<string>("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")
  const [loading, setLoading] = useState(true)
  const [openInitDialog, setOpenInitDialog] = useState<boolean>(false)
  const [initType, setInitType] = useState<InitType>("none")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<IBookmark>()
  const [enableRemoteFilter, setEnableRemoteFilter] = useState<boolean>(false)
  const fuseRef = useRef<Fuse<string>>()

  const fetchTags = useMemo(
    () =>
      debounce(
        async (
          { keyword }: { keyword: string },
          callback: (results: ITagItem[]) => void
        ) => {
          const { status, data } = await sendToBackground<
            TagListRequestBody,
            TagListResponseBody
          >({
            name: "tags/list",
            body: {
              keyword
            }
          })
          if (status === "success") {
            callback(data.tags)
          } else {
            setAlertContent("获取 Tag 列表失败")
            setAlertType("error")
            setAlertOpen(true)
            callback([])
          }
        },
        400
      ),
    []
  )

  const localFilterTagFn = useCallback(
    (options: string[], { inputValue }: { inputValue: string }) => {
      const str = "tag:"

      if (inputValue.startsWith(str)) {
        const keyword = inputValue.split(str)[1]
        if (keyword.length === 0) {
          return options
        }
        const list = options.map((o) => o.replace(str, ""))
        const fuse = fuseRef.current
          ? fuseRef.current
          : (fuseRef.current = new Fuse(list, { keys: ["name"] }))
        const result = fuse.search(`${keyword}`)
        const filteredOptions = result.map((r) => `${str}${r.item}`)
        return filteredOptions
      }

      return []
    },
    []
  )

  useEffect(() => {
    const checkServerExist = async () => {
      const storageServer = await instance.get(StorageServer)
      if (!storageServer) {
        setInitType("storage-server")
        setOpenInitDialog(true)
        return false
      }

      return true
    }

    const initBookmarksData = async () => {
      const {
        bookmarks: bookmarksFromBrowser,
        status,
        message
      } = await sendToBackground<
        GetBookmarksFromBrowserRequest,
        GetBookmarksFromBrowserResponse
      >({
        name: "bookmark/get-from-browser"
      })

      console.info("bookmarksFromBrowser", bookmarksFromBrowser)

      if (status === "fail") {
        setAlertContent(`获取浏览器书签数据失败: ${message}`)
        setAlertType("error")
        setAlertOpen(true)
        return
      }

      // 同步到后端
      const batchResult = await sendToBackground<
        BookmarkBatchRequestBody,
        BookmarkBatchResponseBody
      >({
        name: "bookmark/batch",
        body: {
          bookmarks: bookmarksFromBrowser
        }
      })

      if (batchResult.status === "fail") {
        setAlertContent(`同步书签数据失败: ${batchResult.message}`)
        setAlertType("error")
        setAlertOpen(true)
        return
      }
      return bookmarksFromBrowser
    }

    const main = async () => {
      const init = await checkServerExist()
      if (!init) {
        setLoading(false)
        return
      }
      const {
        status,
        data: { bookmarks },
        message
      } = await sendToBackground<
        GetBookmarksRequestBody,
        GetBookmarksResponseBody
      >({ name: "bookmark/get" })
      if (status === "success") {
        if (bookmarks.length > 0) {
          setBookmarks(bookmarks)

          const { status, data } = await sendToBackground<
            TagListRequestBody,
            TagListResponseBody
          >({
            name: "tags/list",
            body: {
              keyword: ""
            }
          })
          if (status === "success") {
            if (data.tags.length > TAG_LIST_LIMIT) {
              setEnableRemoteFilter(true)
            } else {
              setAvailableTags(data.tags)
            }
          } else {
            setAlertContent("获取 Tag 列表失败")
            setAlertType("error")
            setAlertOpen(true)
          }
          setLoading(false)
        } else {
          // 从浏览器获取书签数据，并同步到后端
          const initBookmarks = await initBookmarksData()
          setBookmarks(initBookmarks)
          setLoading(false)
        }
      } else {
        setAlertContent(`获取书签数据失败: ${message}`)
        setAlertType("error")
        setLoading(false)
        setAlertOpen(true)
      }
    }
    main()

    // TODO:  初始化数据
    // flattenBookmarks(mockBookmarksData);
  }, [])

  useEffect(() => {
    let active = true
    const fn = async () => {
      const keyword = searchText.split("tag:")[1]
      await fetchTags({ keyword }, (tags) => {
        if (active) {
          setAvailableTags(tags)
        }
      })
    }
    if (enableRemoteFilter) {
      if (searchText.startsWith("tag:")) {
        fn()
      } else {
        setAvailableTags([])
      }
    }

    return () => {
      active = false
    }
  }, [searchText, fetchTags, enableRemoteFilter])

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchText.startsWith("tag:")) {
      const tagName = searchText.split(":")[1].trim()
      if (
        tagName &&
        !searchTags.find((searchTag) => searchTag.name === tagName)
      ) {
        setSearchTags([
          ...searchTags,
          { name: tagName, source: "SYSTEM", browserType }
        ])
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
        setSearchTags([
          ...searchTags,
          { name: tagName, source: "SYSTEM", browserType }
        ])
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

  const handleEditClick = (bookmark: IBookmark) => {
    setEditingBookmark(bookmark)
    setEditorOpen(true)
  }

  const handleEditClose = () => {
    setEditorOpen(false)
  }

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
        const index = bookmarks.findIndex(
          (bookmark) => bookmark.id === updatedBookmark.id
        )
        if (index !== -1) {
          const updatedBookmarks = [...bookmarks]
          updatedBookmarks[index] = updatedBookmark
          setBookmarks(updatedBookmarks)
        }

        // 更新本地 tag
        const { status, data } = await sendToBackground<
          TagListRequestBody,
          TagListResponseBody
        >({
          name: "tags/list",
          body: {
            keyword: ""
          }
        })
        if (status === "success") {
          if (data.tags.length > TAG_LIST_LIMIT) {
            setEnableRemoteFilter(true)
          } else {
            setAvailableTags(data.tags)
          }
        } else {
          setAlertContent("获取 Tag 列表失败")
          setAlertType("error")
          setAlertOpen(true)
        }
        
        setAlertType("success")
        setAlertContent("更新成功")
        setEditorOpen(false)
      } else {
        setAlertType("error")
        setAlertContent("更新失败")
      }
      setAlertOpen(true)
    },
    [bookmarks]
  )

  const handleRemoveBookmark = async (removingBookmark: IBookmark) => {
    const result = await sendToBackground<
      BookmarkRemoveRequestBody,
      BookmarkRemoveResponseBody
    >({
      name: "bookmark/remove",
      body: {
        bookmark: removingBookmark
      }
    })
    if (result.status === "success") {
      const index = bookmarks.findIndex(
        (bookmark) => bookmark.id === removingBookmark.id
      )
      if (index !== -1) {
        const newBookmarks = [...bookmarks]
        newBookmarks.splice(index, 1)
        setBookmarks(newBookmarks)
      }
      setAlertContent(`书签移除成功`)
      setAlertType("success")
      setAlertOpen(true)
      setEditorOpen(false)
    } else {
      setAlertContent(`书签移除失败，请重试`)
      setAlertType("error")
      setAlertOpen(true)
    }
  }

  const handleGenerateNewTags: OnGenerateNewTags = async ({ url, count }) => {
    const result = await sendToBackground<
      TagsGenerateRequestBody,
      TagsGenerateResponseBody
    >({
      name: "tags/generate",
      body: {
        url,
        count
      }
    })

    if (result.status === "success") {
      return result.data.tags
    } else {
      setAlertContent(`生成标签失败: ${result.message}`)
      setAlertType("error")
      setAlertOpen(true)
      return []
    }
  }

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

  const handleGoToSetPage: OnGoToSettingPage = (type) => {
    if (type === "storage-server") {
      navigate("/storage")
    }
    setOpenInitDialog(false)
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
        filterOptions={
          enableRemoteFilter
            ? (x) => x // override default filter fn and use remote filter feature
            : localFilterTagFn
        }
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
              primary={
                <Link
                  underline="hover"
                  target="_blank"
                  rel="noreferrer"
                  href={bookmark.url}>
                  {bookmark.title}
                </Link>
              }
              secondary={
                <Box
                  component="span" // https://stackoverflow.com/questions/41928567/div-cannot-appear-as-a-descendant-of-p
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {bookmark.tags.slice(0, 5).map((tag) => (
                    <Chip component={"span"} key={tag.name} label={tag.name} />
                  ))}
                  {bookmark.tags.length > 5
                    ? `+${bookmark.tags.length - 5}`
                    : null}
                  <IconButton onClick={() => handleEditClick(bookmark)}>
                    <EditIcon />
                  </IconButton>
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
        <Alert severity={alertType}>{alertContent}</Alert>
      </Snackbar>
      <BookmarkEditorDialog
        open={editorOpen}
        onClose={handleEditClose}
        bookmark={editingBookmark}
        onTagsUpdated={handleUpdateBookmark}
        onRemove={handleRemoveBookmark}
        onGenerateNewTags={handleGenerateNewTags}
      />
      <InitDialog
        open={openInitDialog}
        type={initType}
        onGoToSettingPage={handleGoToSetPage}></InitDialog>
    </div>
  )
}

export default BookmarkManager
