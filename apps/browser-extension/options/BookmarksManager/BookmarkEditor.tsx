import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import type { IBookmark, ITagItem } from "api-types"
import React, { useCallback, useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { GeneralSetting, getStorage } from "~storage/index"
import { detectBrowser } from "~utils/browser"

export type OnTagsUpdate = (bookmark: IBookmark) => Promise<void> | void
export type OnRemove = (bookmark: IBookmark) => Promise<void> | void
export type OnGenerateNewTags = ({
  url,
  count
}: {
  url: string
  count: number
}) => Promise<ITagItem[]> | ITagItem[]

export interface BookmarkProps {
  bookmark?: IBookmark
  onTagsUpdated?: OnTagsUpdate
  onClose?: () => void
  onGenerateNewTags?: OnGenerateNewTags
  onRemove?: OnRemove
}

const browserType = detectBrowser();

const defaultBookmark: IBookmark = {
  title: "",
  tags: [],
  id: "",
  url: "",
  dateAdded: 0,
  browserType
}

const instance = getStorage()

const BookmarkEditor: React.FC<BookmarkProps> = ({
  bookmark = defaultBookmark,
  onClose,
  onTagsUpdated,
  onRemove,
  onGenerateNewTags
}) => {
  const [editTitle, setEditTitle] = useState(bookmark.title)
  const [editTags, setEditTags] = useState<ITagItem[]>([])
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null)
  const [editingOriginalValue, setEditingOriginalValue] = useState<string>("")

  const [saveBtnLoading, setSaveBtnLoading] = useState<boolean>(false)
  const [genTagBtnLoading, setGenTagBtnLoading] = useState<boolean>(false)
  const [removeBtnLoading, setRemoveBtnLoading] = useState<boolean>(false)
  // const [newTagName, setNewTagName] = useState('');

  const [tagMaxCount] = useStorage(
    {
      key: GeneralSetting.BookmarkTagsCount,
      instance
    },
    (v) => (v === undefined ? 5 : v)
  )

  useEffect(() => {
    setEditTags(bookmark.tags)
  }, [bookmark.tags])

  const handleClose = () => {
    onClose && onClose()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value)
  }

  const handleTagDoubleClick = (index: number) => {
    setEditingTagIndex(index)
    setEditingOriginalValue(editTags[index].name)
  }

  const handleTagChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedTags = [...editTags]
    updatedTags[index] = { ...updatedTags[index], name: e.target.value }
    setEditTags(updatedTags)
  }

  const handleTagBlur = (index: number) => {
    if (editTags[index].name.trim() === "") {
      // If the edited tag is empty and it's not a new tag, revert changes
      if (editingOriginalValue.length > 0) {
        const updatedTags = [...editTags]
        updatedTags[index].name = editingOriginalValue
        setEditTags(updatedTags)
      } else {
        // If it's a new tag, remove it
        const updatedTags = editTags.filter((_, i) => i !== index)
        setEditTags(updatedTags)
      }
    }
    // Reset editing index
    setEditingOriginalValue("")
    setEditingTagIndex(null)
  }

  const handleTagEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      handleTagBlur(index)
    }
  }

  const handleAddTag = () => {
    // Check if the last tag is empty before adding a new one
    if (
      editTags.length === 0 ||
      editTags[editTags.length - 1].name.trim() !== ""
    ) {
      setEditTags([...editTags, { name: "", source: "USER", browserType }])
      setEditingTagIndex(editTags.length) // This will be the index of the new tag
    }
  }

  const generateTags = async () => {
    setGenTagBtnLoading(true)

    if (onGenerateNewTags) {
      const newTags = await onGenerateNewTags({
        url: bookmark.url,
        count: tagMaxCount - bookmark.tags.length
      })
      setEditTags([...editTags, ...newTags])
    }

    setGenTagBtnLoading(false)
  }

  const handleSave = async () => {
    setSaveBtnLoading(true)
    if (onTagsUpdated) {
      await onTagsUpdated({
        ...bookmark,
        title: editTitle,
        tags: editTags
      })
    }
    setSaveBtnLoading(false)
  }

  const handleTagDelete = (tagToDelete) => () => {
    setEditTags((tags) => tags.filter((tag) => tag !== tagToDelete))
  }

  const handleDelete = async () => {
    setRemoveBtnLoading(true)
    if (onRemove) {
      await onRemove(bookmark)
    }
    setRemoveBtnLoading(false)
  }

  return (
    <>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            textAlign: "center",
            justifyContent: "space-between"
          }}>
          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            variant="h6">
            编辑
          </Typography>
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          {/* 添加提示信息，提示如何操作 */}
        </Box>
        <Box sx={{ marginTop: "10px" }}>
          <TextField
            fullWidth
            value={editTitle}
            onChange={handleTitleChange}
            variant="outlined"
            sx={{ flex: "0.8 1 auto" }}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* <Box sx={{ flex: 'row', gap: '2px', flexWrap: 'wrap' }}> */}
        <Grid container spacing={1} sx={{ margin: "8px 0 0 0" }}>
          {editTags.map((tag, index) => (
            <Grid item key={index}>
              {editingTagIndex === index ? (
                <TextField
                  key={index}
                  value={tag.name}
                  onChange={(e) => handleTagChange(e as any, index)}
                  onBlur={() => handleTagBlur(index)}
                  onKeyDown={(e) => handleTagEnter(e as any, index)}
                  autoFocus
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Chip
                  key={index}
                  label={tag.name}
                  onDelete={handleTagDelete(tag)}
                  onDoubleClick={() => handleTagDoubleClick(index)}
                />
              )}
            </Grid>
          ))}
          <IconButton onClick={handleAddTag}>
            <AddIcon />
          </IconButton>
          {/* </Box> */}
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
        <LoadingButton
          loading={genTagBtnLoading}
          onClick={generateTags}
          variant="contained"
          disabled={bookmark.tags.length === tagMaxCount}
          color="secondary">
          生成推荐标签
          {/* （还可生成 {tagMaxCount - bookmark.tags.length} 个） */}
        </LoadingButton>
        <Stack direction="row" gap="10px">
          <LoadingButton
            loading={removeBtnLoading}
            onClick={handleDelete}
            color="error"
            variant="outlined">
            <span>删除</span>
          </LoadingButton>
          <LoadingButton
            onClick={handleSave}
            loading={saveBtnLoading}
            variant="contained">
            <span>保存</span>
          </LoadingButton>
        </Stack>
      </DialogActions>
    </>
  )
}

export interface BookmarkDialogProps extends BookmarkProps {
  open?: boolean
}

const BookmarkEditorDialog: React.FC<BookmarkDialogProps> = ({
  open,
  ...props
}) => {
  const handleClose = () => {
    props.onClose && props.onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <BookmarkEditor {...props}></BookmarkEditor>
      </Dialog>
    </>
  )
}

export { BookmarkEditorDialog, BookmarkEditor }
