import AddIcon from "@mui/icons-material/Add"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Skeleton,
  TextField,
  Typography
} from "@mui/material"
import type { ITagItem } from "api-types"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, StorageKeyHash } from "~storage/index"

import { checkIfBookmarked } from "../chrome-utils"

const getCurrentTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]
  return currentTab
}

enum BookmarkAction {
  CREATE,
  MODIFY,
  NONE
}

const instance = getStorage()

const BookmarkCard = () => {
  console.info("run BookmarkCard")
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

  useEffect(() => {
    const analyzeTags = async ({ url }) => {
      const apiKey = await instance.get(StorageKeyHash.GEMINI_API_KEY)
      console.info("apiKey", apiKey)
      const { tags } = await sendToBackground({
        name: "ai-tags",
        body: {
          url,
          apiKey
        }
      })
      console.info("tags", tags)
      return tags
    }
    const getTagsByUrl = async ({ url }) => {
      const { tags } = await sendToBackground<
        { url: string },
        { tags: ITagItem[] }
      >({
        name: "get-tags-from-storage",
        body: { url }
      })
      return tags
    }
    const main = async () => {
      const currentTab = await getCurrentTab()
      const { url, title } = currentTab
      const isBookmarked = await checkIfBookmarked(url)
      console.info("isBookmarked", isBookmarked)

      if (!isBookmarked) {
        await sendToBackground({ name: "popup-open" })
      }
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
        console.info("get exist tags", tags)
        setTags(tags)
      }
      setAppearFetchTagLoading(false)
    }
    main()

    // Fetch current bookmark details using chrome.bookmarks API
    // Set title and tags based on fetched data
  }, [])

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
    // Complete bookmark creation or modification
    // TODO: 调用相关接口，同步数据
    if (bookmarkAction === BookmarkAction.CREATE) {
      const result = await sendToBackground({
        name: "add-bookmark-to-storage",
        body: {
          url: websiteUrl,
          tags
        }
      })
      console.info(result)
    } else if (bookmarkAction === BookmarkAction.MODIFY) {
      console.info("updated tags", tags)
      await sendToBackground<{ url: string; tags: ITagItem[] }, {}>({
        name: "update-bookmark-tags",
        body: {
          url: websiteUrl,
          tags
        }
      })
    }

    window.close()
  }

  const handleRemove = async () => {
    const result = await sendToBackground({
      name: "remove-bookmark"
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

  return (
    <Card sx={{ width: 448, minHeight: 233 }}>
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
        {/* <div> */}
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
                <div key={index} onDoubleClick={handleTagDoubleClick(index)}>
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

        {/* </div> */}
        {/* <div>
          <TextField
            value={newTag}
            onChange={handleNewTagChange}
            placeholder="添加分类"
            size="small"
            sx={{ mt: 1 }}
          />
        </div> */}
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
            <Button variant="contained" color="warning" onClick={handleRemove}>
              移除
            </Button>
          ) : null}
          <Button variant="contained" onClick={handleComplete}>
            {bookmarkAction === BookmarkAction.MODIFY ? "修改标签" : "添加标签"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BookmarkCard
