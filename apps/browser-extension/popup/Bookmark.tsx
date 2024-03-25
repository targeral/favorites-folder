import AddIcon from "@mui/icons-material/Add"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Skeleton,
  Snackbar,
  TextField,
  Typography
} from "@mui/material"
import type { ITagItem } from "api-types"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, StorageKeyHash } from "~storage/index"
import { log } from "~utils/log"

import {
  checkIfBookmarked,
  checkIsNewTab,
  getCurrentActiveTab
} from "../chrome-utils"

enum BookmarkAction {
  CREATE,
  MODIFY,
  NONE
}

const instance = getStorage()

const Bookmark = () => {
  log("run BookmarkCard")
  const [bookmarkAction, setBookmarkAction] = useState<BookmarkAction>(
    BookmarkAction.NONE
  )
  const [actionText, setActionText] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [websiteTitle, setWebsiteTitle] = useState("")
  const [tags, setTags] = useState<ITagItem[]>([])
  const [newTag, setNewTag] = useState<ITagItem>()
  const [editTagIndex, setEditTagIndex] = useState(null)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [appearFetchTagLoading, setAppearFetchTagLoading] =
    useState<boolean>(true)
  const [newTab, setNewTab] = useState<boolean>(true)
  const [saveBtnLoading, setSaveBtnLoading] = useState<boolean>(false)
  const [appearSnackbar, setAppearSnackbar] = useState<boolean>(false)
  const [snackBarContent, setSnackBarContent] = useState<string>("")

  const [autoBookmark] = useStorage<boolean>(
    {
      key: StorageKeyHash.SETTING_AUTO_BOOKMARK,
      instance
    },
    false
  )

  useEffect(() => {
    const analyzeTags = async ({ url }) => {
      const apiKey = await instance.get(StorageKeyHash.GEMINI_API_KEY)
      log("apiKey", apiKey)
      const { tags } = await sendToBackground({
        name: "tags/generate",
        body: {
          url,
          apiKey
        }
      })
      log("tags", tags)
      return tags
    }
    const getTagsByUrl = async ({ url }) => {
      const { tags } = await sendToBackground<
        { url: string },
        { tags: ITagItem[] }
      >({
        name: "tags/get-from-storage",
        body: { url }
      })
      return tags
    }
    const main = async () => {
      const currentTab = await getCurrentActiveTab()
      const isNewTab = checkIsNewTab(currentTab)
      const { url, title } = currentTab
      const isBookmarked = await checkIfBookmarked(url)
      log("isBookmarked", isBookmarked)

      if (isNewTab) {
        setNewTab(true)
        setAppearFetchTagLoading(false)
        return
      }

      setNewTab(false)
      setWebsiteUrl(url)
      setWebsiteTitle(title)
      setBookmarkAction(
        isBookmarked ? BookmarkAction.MODIFY : BookmarkAction.CREATE
      )
      setActionText(isBookmarked ? "修改" : "创建")

      if (!isBookmarked) {
        const tags = await analyzeTags({ url })
        setTags(tags)
      } else {
        const tags = await getTagsByUrl({ url })
        log("get exist tags", tags)
        setTags(tags)
      }
      setAppearFetchTagLoading(false)
    }
    main()
    // Set title and tags based on fetched data
  }, [])

  useEffect(() => {
    const autoBookmarkFun = async () => {
      if (!newTab && bookmarkAction === BookmarkAction.CREATE) {
        await sendToBackground({ name: "popup-open" })
      }
    }
    log("autoBookmark", autoBookmark)
    if (autoBookmark) {
      autoBookmarkFun()
    }
  }, [newTab, bookmarkAction, autoBookmark])

  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    // Update bookmark title using chrome.bookmarks API
  }

  const handleTitleChange = (event) => {
    setWebsiteTitle(event.target.value)
  }

  const handleTagDelete = (tagToDelete) => () => {
    // Remove tag from bookmark using chrome.bookmarks API
    setTags((tags) => tags.filter((tag) => tag !== tagToDelete))
  }

  const handleAddTag = () => {
    // Add new tag to bookmark using chrome.bookmarks API
    setTags([...tags, newTag])
    setNewTag(newTag)
  }

  const handleComplete = async () => {
    setSaveBtnLoading(true)
    if (bookmarkAction === BookmarkAction.CREATE) {
      const result = await sendToBackground({
        name: "bookmark/add",
        body: {
          tags
        }
      })
      if (result.status === "success") {
        setSnackBarContent("保存成功！")
      } else {
        setSnackBarContent("保存失败，请重试！");
      }
    } else if (bookmarkAction === BookmarkAction.MODIFY) {
      const result = await sendToBackground<
        { url: string; tags?: ITagItem[]; title?: string; },
        { status: "success" | "fail"; message?: string }
      >({
        name: "bookmark/update",
        body: {
          url: websiteUrl,
          tags,
          title: websiteTitle,
        }
      })
      if (result.status === "success") {
        setSnackBarContent("更新成功！");
      } else {
        setSnackBarContent(`更新失败，请重试！`);
      }
    }
    setSaveBtnLoading(false)
    setAppearSnackbar(true)
  }

  const handleRemove = async () => {
    const result = await sendToBackground({
      name: 'bookmark/remove'
    })

    if (result.message) {
      setBookmarkAction(BookmarkAction.CREATE)
    }
  }

  const handleManageClick = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleTagDoubleClick = (index) => () => {
    setEditTagIndex(index)
  }

  const handleTagChange = (index) => (event) => {
    const newTags = [...tags]
    newTags[index].name = event.target.value
    setTags(newTags)
  }

  const handleTagKeyPress = (index) => (event) => {
    if (event.key === "Enter") {
      if (!tags[index].name.trim()) {
        // 如果标签为空，则移除它
        setTags((currentTags) => currentTags.filter((_, i) => i !== index))
      }
      setEditTagIndex(null)
    }
  }

  const handleTagBlur = (index) => () => {
    if (!tags[index]) {
      // 如果标签为空，则移除它
      setTags((currentTags) => currentTags.filter((_, i) => i !== index))
    }
    setEditTagIndex(null)
    setIsAddingTag(false)
  }

  const handleAddTagClick = () => {
    setTags([...tags, { name: "", source: "USER" }])
    setIsAddingTag(true)
    setEditTagIndex(tags.length)
  }

  const handleSnackBarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return
    }
    setAppearSnackbar(false)
    window.close();
  }

  return (
    <Card sx={{ width: 448, minHeight: 233 }}>
      {newTab ? (
        <div>此处正在施工🚧</div>
      ) : (
        <>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: "bold" }}>
                {actionText}
              </Typography>
              {isEditingTitle ? (
                <TextField
                  value={websiteTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  autoFocus
                  fullWidth
                  size="small"
                  sx={{ maxWidth: "calc(300px - 48px)" }} // 48px 是操作和结尾内容的宽度估算
                />
              ) : (
                <Typography
                  onClick={handleTitleClick}
                  variant="subtitle1"
                  component="span"
                  noWrap
                  sx={{ maxWidth: "calc(300px - 48px)" }}>
                  {websiteTitle}
                </Typography>
              )}
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: "bold" }}>
                书签
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              当前书签的推荐分类为：
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
                mt: 2
              }}>
              <>
                {appearFetchTagLoading ? (
                  <Skeleton
                    variant="rounded"
                    sx={{ height: "30px", flex: "1 1 auto" }}
                    animation="wave"
                  />
                ) : (
                  tags.map((tag, index) => (
                    <div
                      key={index}
                      onDoubleClick={handleTagDoubleClick(index)}>
                      {editTagIndex === index ? (
                        <TextField
                          value={tag.name}
                          onChange={handleTagChange(index)}
                          onBlur={handleTagBlur(index)}
                          onKeyDown={handleTagKeyPress(index)}
                          autoFocus
                          size="small"
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Chip
                          label={tag.name}
                          onDelete={handleTagDelete(tag)}
                          // onDoubleClick={handleTagDoubleClick(index)}
                        />
                      )}
                    </div>
                    // <Chip
                    //   key={index}
                    //   label={tag}
                    //   onDelete={handleTagDelete(tag)}
                    //   deleteIcon={<CloseIcon />}
                    //   sx={{ mr: 1, mt: 1 }}
                    // />
                  ))
                )}
                <IconButton onClick={handleAddTagClick} size="small">
                  <AddIcon />
                </IconButton>
              </>
            </Box>
          </CardContent>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Button variant="outlined" onClick={handleManageClick}>
              管理书签
            </Button>
            <Box display="flex" alignItems="center" gap={2}>
              {bookmarkAction === BookmarkAction.MODIFY ? (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleRemove}>
                  移除
                </Button>
              ) : null}
              <LoadingButton
                loading={saveBtnLoading}
                variant="contained"
                onClick={handleComplete}>
                <span>
                  {bookmarkAction === BookmarkAction.MODIFY ? "更新" : "保存"}
                </span>
              </LoadingButton>
            </Box>
          </CardContent>
        </>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={appearSnackbar}
        autoHideDuration={2000}
        message="Success"
        onClose={handleSnackBarClose}>
        <Alert severity="success" sx={{ width: "50%" }}>
          {snackBarContent}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export { Bookmark }
