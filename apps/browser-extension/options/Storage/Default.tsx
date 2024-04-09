import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
  Box,
  Button,
  IconButton,
  Modal,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  InputAdornment,
  Alert
} from "@mui/material"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  GenerateDSTokenRequestBody,
  GenerateDSTokenResponseBody
} from "~background/messages/account/default-server"
import { DefaultStorageKey, getStorage } from "~storage/index"

import {
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "../components/Accordion"

const instance = getStorage()

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
}

export interface DefaultServerSettingProps {
  enable?: boolean
  onEnableChange?: (enable: boolean) => void
}

export const DefaultStorageSetting = ({
  enable,
  onEnableChange
}: DefaultServerSettingProps) => {
  const [showToken, setShowToken] = useState<boolean>(false)
  const [showGetTokenPage, setShowGetTokenPage] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertContent, setAlertContent] = useState<string>("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")
  const [newToken, setNewToken] = useState<string>('')

  const [
    token,
    _setToken,
    { setRenderValue: setToken, setStoreValue: saveToken }
  ] = useStorage<string>(
    {
      key: DefaultStorageKey.TOKEN,
      instance
    },
    (v) => (v === undefined ? "" : v)
  )

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(DefaultStorageKey.TOKEN)
      if (token && token.length > 0) {
        setShowToken(false)
      } else {
        setShowToken(true)
      }
    }
    main()
  }, [])

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const handleGenerateToken = async () => {
    // 此处模拟生成token的逻辑
    const result = await sendToBackground<GenerateDSTokenRequestBody, GenerateDSTokenResponseBody>({
      name: "account/default-server",
      body: {
        email,
        password
      }
    })
    if (result.status === 'success') {
      setNewToken(result.data.token);
    } else {
      setAlertContent(`生成 Token 失败: ${result.message}`);
      setAlertType('error');
      setAlertOpen(true);
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
    setAlertContent('复制成功');
    setAlertType('success');
    setAlertOpen(true)
  }

  const handleTokenChange = (event) => {
    setToken(event.target.value)
  }

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnableChange && onEnableChange(event.target.checked)
  }

  const save = () => {
    saveToken(token)
  }

  const handleShowGetTokenPage = () => {
    setShowGetTokenPage(true)
  }

  const handleCloseGetTokenPage = () => {
    setShowGetTokenPage(false)
  }

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

  return (
    <>
      <Accordion sx={{ width: "100%" }}>
        <AccordionSummary
          aria-controls="default-server-content"
          id="default-server-header">
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography>Default Server</Typography>
              <Button
                size="small"
                onClick={handleShowGetTokenPage}
                variant="text">
                获取 Token
              </Button>
            </Box>
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
            <TextField
              type={showToken ? "text" : "password"}
              label="Token:"
              value={token}
              onChange={handleTokenChange}
              onBlur={save}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Modal
        open={showGetTokenPage}
        onClose={handleCloseGetTokenPage}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Stack sx={style} spacing={2}>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            fullWidth
          />
          <Button variant="contained" onClick={handleGenerateToken}>
            Generate Token
          </Button>
          {newToken && (
            <TextField
              label="Generated Token"
              variant="outlined"
              fullWidth
              disabled
              value={newToken}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyToken}>
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
        </Stack>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alertOpen}
        autoHideDuration={2000}
        onClose={handleAlertClose}>
        <Alert severity={alertType}>{alertContent}</Alert>
      </Snackbar>
    </>
  )
}
