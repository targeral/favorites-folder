import AddIcon from "@mui/icons-material/Add"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormHelperText,
  IconButton,
  Link,
  Skeleton,
  Snackbar,
  TextField,
  Typography
} from "@mui/material"
import type { ITagItem } from "api-types"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  BookmarkAddRequestBody,
  BookmarkAddResponseBody,
  BookmarkRemoveByUrlRequestBody,
  BookmarkRemoveByUrlResponseBody,
  BookmarkUpdateByUrlRequestBody,
  BookmarkUpdateByUrlResponseBody,
  TagsGenerateRequestBody,
  TagsGenerateResponseBody,
  TagsGetRequestBody,
  TagsGetResponseBody
} from "~background/types"
import { openOptionsPage } from "~chrome-utils/open"
import {
  getStorage,
  StorageKeyHash,
  StorageServer,
  TagAIServer
} from "~storage/index"
import { log } from "~utils/log"

import {
  checkIfBookmarked,
  checkIsNewTab,
  getCurrentActiveTab
} from "../chrome-utils"
import { detectBrowser } from "~utils/browser"

enum BookmarkAction {
  CREATE,
  MODIFY,
  NONE
}

const instance = getStorage()
const browserType = detectBrowser();

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
  const [deleteBtnLoading, setDeleteBtnLoading] = useState<boolean>(false)
  const [appearAlert, setAppearAlert] = useState<boolean>(false)
  const [alertContent, setAlertContent] = useState<string>("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")
  const [autoCloseWindow, setAutoCloseWindow] = useState<boolean>(false)
  const [autoGenerateTags, setAutoGenerateTags] = useState<boolean>(false)
  const [appearGenTagLink, setAppearGenTagLink] = useState<boolean>(false)

  const [autoBookmark] = useStorage<boolean>(
    {
      key: StorageKeyHash.SETTING_AUTO_BOOKMARK,
      instance
    },
    false
  )
  // const [] = useStorage<string>({
  //   key: TagAIServer,
  //   instance
  // })

  useEffect(() => {
    const instance = getStorage()
    const checkIfInit = async () => {
      const storageServer = await instance.get(StorageServer)

      if (!storageServer) {
        chrome.runtime.openOptionsPage()
        return false
      }

      return true
    }
    const analyzeTags = async ({ url }) => {
      const result = await sendToBackground<
        TagsGenerateRequestBody,
        TagsGenerateResponseBody
      >({
        name: "tags/generate",
        body: {
          url
        }
      })
      if (result.status === "success") {
        return result.data.tags
      } else {
        setAlertContent(`标签生成失败: ${result.message}`)
        setAlertType("error")
        setAppearAlert(true)
        return []
      }
    }
    const getTagsByUrl = async ({ url }) => {
      const { status, data, message } = await sendToBackground<
        TagsGetRequestBody,
        TagsGetResponseBody
      >({
        name: "tags/get",
        body: { url }
      })
      if (status === "fail") {
        setAlertContent(message)
        setAlertType("error")
        setAppearAlert(true)
        return []
      }

      return data.tags
    }
    const main = async () => {
      const init = await checkIfInit()
      if (!init) {
        return
      }

      const aiServer = await instance.get(TagAIServer)
      if (aiServer) {
        setAutoGenerateTags(true)
      } else {
        setAppearGenTagLink(true)
      }

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
        const tags = aiServer ? await analyzeTags({ url }) : []
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
      const result = await sendToBackground<
        BookmarkAddRequestBody,
        BookmarkAddResponseBody
      >({
        name: "bookmark/add",
        body: {
          tags
        }
      })
      if (result.status === "success") {
        setAlertContent("保存成功！")
        setAutoCloseWindow(true)
      } else {
        setAutoCloseWindow(false)
        setAlertContent("保存失败，请重试！")
      }
    } else if (bookmarkAction === BookmarkAction.MODIFY) {
      const result = await sendToBackground<
        BookmarkUpdateByUrlRequestBody,
        BookmarkUpdateByUrlResponseBody
      >({
        name: "bookmark/update-by-url",
        body: {
          url: websiteUrl,
          tags,
          title: websiteTitle
        }
      })
      if (result.status === "success") {
        setAlertContent("更新成功！")
        setAutoCloseWindow(true)
      } else {
        setAlertContent(`更新失败，请重试！`)
        setAutoCloseWindow(false)
      }
    }

    setSaveBtnLoading(false)
    setAppearAlert(true)
  }

  const handleRemove = async () => {
    setDeleteBtnLoading(true)
    const result = await sendToBackground<
      BookmarkRemoveByUrlRequestBody,
      BookmarkRemoveByUrlResponseBody
    >({
      name: "bookmark/remove-by-url",
      body: {
        url: websiteUrl
      }
    })

    if (result.status === "success") {
      setAlertContent("移除成功！")
      setAlertType("success")
      setAutoCloseWindow(true)
      setBookmarkAction(BookmarkAction.CREATE)
    } else {
      setAlertContent("移除失败，请重试！")
      setAlertType("error")
      setAutoCloseWindow(false)
      setBookmarkAction(BookmarkAction.MODIFY)
    }

    setDeleteBtnLoading(false)
    setAppearAlert(true)
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
    setTags([...tags, { name: "", source: "USER", browserType }])
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
    setAppearAlert(false)
    if (autoCloseWindow) {
      window.close()
    }
  }

  const goToTagSettingPage = () => {
    openOptionsPage("#tags")
  }

  const Instrument = () => (
    <>
      或尝试开启<Link sx={{ cursor: 'pointer' }} onClick={goToTagSettingPage}>推荐标签功能</Link>
    </>
  )

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
              {autoGenerateTags ? "当前书签的推荐分类为：" : "添加书签分类："}
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
                  ))
                )}
                <IconButton onClick={handleAddTagClick} size="small">
                  <AddIcon />
                </IconButton>
                {tags.length === 0 ? (
                  <FormHelperText>
                    点击 "+" 新增标签。{appearGenTagLink ? <Instrument /> : null}
                  </FormHelperText>
                ) : null}
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
                <LoadingButton
                  loading={deleteBtnLoading}
                  variant="contained"
                  color="warning"
                  onClick={handleRemove}>
                  <span>移除</span>
                </LoadingButton>
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
        open={appearAlert}
        autoHideDuration={2000}
        onClose={handleSnackBarClose}>
        <Alert severity={alertType} sx={{ width: "50%" }}>
          {alertContent}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export { Bookmark }
