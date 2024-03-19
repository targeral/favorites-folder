import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import CloseIcon from "@mui/icons-material/Close"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material"
import { GithubStorage } from "github-store"
import React, { useCallback, useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, StorageKeyHash } from "~storage/index"
import type { IBookmark, ITagItem } from "api-types";

const instance = getStorage()

function Settings() {
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

  const [showToken, setShowToken] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [snackbarContent, setSnackbarContent] = useState<string>("")

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(StorageKeyHash.TOKEN)
      if (token && token.length > 0) {
        setShowToken(false)
      } else {
        setShowToken(true)
      }
    }
    main()
  }, [])

  const getGS = useCallback(() => {
    const gs = new GithubStorage({
      token,
      repo,
      owner,
      email,
      storageFolder: "favorites",
      filename: "data.json",
      branch: "main"
    })
    return gs
  }, [token, repo, owner, email])

  const handleSyncBookmarkData = async () => {
    const gs = getGS()
    const { bookmarks } = await sendToBackground<{}, { bookmarks: IBookmark[]}>({ name: "get-bookmarks" });
    console.info('bookmarks', bookmarks);
    const { message } = await gs.syncBookmarks(bookmarks);
    setOpen(true)
    if (message === "success") {
      setSnackbarContent("同步成功")
    } else {
      setSnackbarContent("同步失败，请稍后重试！")
    }
  }

  const handleTokenChange = (event) => {
    setToken(event.target.value)
  }

  const handleRepoChange = (event) => {
    setRepo(event.target.value)
  }

  const handleOwnerChange = (event) => {
    setOwner(event.target.value)
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const handleGeminiApiKeyChange = (event) => {
    setGeminiApiKey(event.target.value)
  }

  const handleTest = async () => {
    // const result = await gs.addBookmark({
    //   tags: [],
    //   id: 1,
    //   title: "测试",
    //   url: "xxxx"
    // })
    // if (result.status === "success") {
    //   alert("添加成功")
    // } else {
    //   alert("添加失败")
    //   console.info(result.error)
    // }
    const gs = getGS();
    const result = await gs.getTagsByBookmarkId({id: "40"});
    console.info(result);
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return
    }

    setOpen(false)
  }

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  )

  return (
    <>
      <Stack direction="column" spacing={2} alignItems="center">
        <h1>设置</h1>
        <Accordion sx={{ width: '100%' }}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="github-content"
            id="github-header">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Github</Typography>
              <Switch />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1
              }}>
              <TextField
                type={showToken ? "text" : "password"}
                label="Github Token:"
                value={token}
                onChange={handleTokenChange}
              />
              <TextField
                label="Github Repo:"
                value={repo}
                onChange={handleRepoChange}
              />
              <TextField
                label="Github owner:"
                value={owner}
                onChange={handleOwnerChange}
              />
              <TextField
                label="Owner email:"
                value={email}
                onChange={handleEmailChange}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSyncBookmarkData}>
                同步
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ width: '100%' }}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="gemini-content"
            id="gemini-header">
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <Typography>Google Gemini</Typography>
              <Switch />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Gemini Api Key"
              value={geminiApiKey}
              onChange={handleGeminiApiKeyChange}
            />
          </AccordionDetails>
        </Accordion>
        <Box>
          <Button variant="outlined" color="primary" onClick={handleTest}>
            测试添加书签功能
          </Button>
        </Box>
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackbarContent}
        action={action}
      />
    </>
  )
}

export default Settings
