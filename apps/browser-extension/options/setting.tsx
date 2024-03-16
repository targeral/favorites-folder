import CloseIcon from "@mui/icons-material/Close"
import { Box, Button, Snackbar, Stack, TextField } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import { GithubStorage } from "github-store"
import React, { useCallback, useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

const StorageKeyHash = {
  TOKEN: "TOKEN",
  REPO: "REPO",
  OWNER: "OWNER",
  EMAIL: "EMAIL"
}

const instance = new Storage({
  area: "local",
  copiedKeyList: Object.values(StorageKeyHash)
})

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

  const [showToken, setShowToken] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [snackbarContent, setSnackbarContent] = useState<string>('');

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(StorageKeyHash.TOKEN)
      if (token.length > 0) {
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
    const { bookmarks } = await sendToBackground({ name: "get-bookmarks" })
    const { message } = await gs.sync(bookmarks)
    setOpen(true);
    if (message === "success") {
      setSnackbarContent('同步成功');
    } else {
      setSnackbarContent('同步失败，请稍后重试！');
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

  const handleTest = async () => {
    const gs = getGS()
    const result = await gs.addBookmark({
      tags: [],
      id: 1,
      title: "测试",
      url: "xxxx"
    })
    if (result.status === "success") {
      alert("添加成功")
    } else {
      alert("添加失败")
      console.info(result.error)
    }
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
