import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import {
  Box,
  Card,
  Link,
  Button,
  Modal,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, GithubStorageKey } from "~storage/index"

import {
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "../components/Accordion"

const instance = getStorage()

export interface GithubStorageSettingProps {
  enable?: boolean
  onEnableChange?: (enable: boolean) => void
}

export const GithubStorageSetting = ({
  enable = false,
  onEnableChange
}: GithubStorageSettingProps) => {
  const [showToken, setShowToken] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [
    token,
    _setToken,
    { setRenderValue: setToken, setStoreValue: saveToken }
  ] = useStorage<string>(
    {
      key: GithubStorageKey.TOKEN,
      instance
    },
    ""
  )
  const [repo, _setRepo, { setRenderValue: setRepo, setStoreValue: saveRepo }] =
    useStorage<string>(
      {
        key: GithubStorageKey.REPO,
        instance
      },
      ""
    )
  const [
    owner,
    _setOwner,
    { setRenderValue: setOwner, setStoreValue: saveOwner }
  ] = useStorage<string>(
    {
      key: GithubStorageKey.OWNER,
      instance
    },
    ""
  )
  const [
    email,
    _setEmail,
    { setRenderValue: setEmail, setStoreValue: saveEmail }
  ] = useStorage<string>(
    {
      key: GithubStorageKey.EMAIL,
      instance
    },
    ""
  )

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(GithubStorageKey.TOKEN)
      if (token && token.length > 0) {
        setShowToken(false)
      } else {
        setShowToken(true)
      }
    }
    main()
  }, [])

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

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnableChange(event.target.checked)
  }

  const save = () => {
    saveOwner(owner)
    saveEmail(email)
    saveRepo(repo)
    saveToken(token)
  }

  const handleModalOpen = () => setOpenModal(true)
  const handleModalClose = () => setOpenModal(false)

  return (
    <>
      <Accordion sx={{ width: "100%" }}>
        <AccordionSummary aria-controls="github-content" id="github-header">
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Typography>Github</Typography>
            <Switch onChange={handleSwitch} checked={enable} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 1
            }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                label="Github Repo:"
                value={repo}
                onChange={handleRepoChange}
                onBlur={save}
                sx={{ flex: "1 1 auto" }}
              />
              <Tooltip
                title={
                  <>
                    <Typography variant="body1">
                      A Github repository for storing data.{" "}
                      <Link
                        href="https://github.com/new"
                        target="_blank"
                        color="#ffc107"
                        rel="noreferrer">
                        To Create
                      </Link>
                    </Typography>
                  </>
                }>
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              label="Github owner:"
              value={owner}
              onChange={handleOwnerChange}
              onBlur={save}
            />
            <TextField
              label="Owner email:"
              value={email}
              onChange={handleEmailChange}
              onBlur={save}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                sx={{ flex: "1 1 auto" }}
                type={showToken ? "text" : "password"}
                label="Github Token:"
                value={token}
                onChange={handleTokenChange}
                onBlur={save}
              />
              <Button
                size="small"
                onClick={handleModalOpen}
                variant="text">
                如何获取?
              </Button>
              {/* <Tooltip
                title={
                  <div>
                    <Typography variant="h6">
                      How to get Github Token
                    </Typography>
                    <Typography variant="body1">
                      1. Click on this{" "}
                      <Link
                        href="https://github.com/settings/personal-access-tokens/new"
                        target="_blank"
                        color="#ffc107"
                        rel="noreferrer">
                        link
                      </Link>{" "}
                      to create
                    </Typography>
                    <Typography variant="body1">
                      2. Find on the page:
                      <Typography sx={{ marginLeft: "20px" }} variant="body2">
                        {`=>\n`} "Repository access"
                      </Typography>
                      <Typography sx={{ marginLeft: "20px" }} variant="body2">
                        {`=>\n`} "Only select repositories"
                      </Typography>
                      <Typography sx={{ marginLeft: "20px" }} variant="body2">
                        {" "}
                        {`=>\n`}"Select Your Repo"
                      </Typography>
                    </Typography>
                  </div>
                }>
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip> */}
            </Box>
          </Box>
          {/* <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={save} variant="contained">保存</Button>
        </Box> */}
        </AccordionDetails>
      </Accordion>
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4
          }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            如何生成 Github Token?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <ol>
              <li>首先点击该 <Link href="https://github.com/settings/personal-access-tokens/new">链接</Link>进入创建 Token 页面。</li>
              <li>输入必须输入的 <b>Token name</b>。</li>
              <li>对于 <b>Repository access</b> 选择 <b>Only select repositories</b>，并选择你要存储书签数据的仓库。</li>
              <li>在 <b>Repository permissions</b> 中需要将 <b>Repository permissions</b> 的 <i>Codespaces</i>、<i>Commit statuses</i>、<i>Contents</i> 的 Access（权限）从 No access 改为 Read and Write。</li>
              <li>最后点击页面底部的 Generate Token 按钮，将会获取 token。</li>
            </ol>
          </Typography>
        </Box>
      </Modal>
    </>
  )
}
