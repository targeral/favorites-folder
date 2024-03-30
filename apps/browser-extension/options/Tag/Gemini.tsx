import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import {
  Box,
  Link,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { GeminiKey, getStorage } from "~storage/index"

import {
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "../components/Accordion"

const instance = getStorage()

export interface GeminiSettingProps {
  enable?: boolean
  onEnableChange?: (enable: boolean) => void
}

export const GeminiSetting = ({
  enable = false,
  onEnableChange
}: GeminiSettingProps) => {
  const [show, setShow] = useState<boolean>(false)
  const [apiKey, setApiKey] = useStorage<string>(
    {
      key: GeminiKey.API_KEY,
      instance
    },
    ""
  )
  const [model, setModel] = useStorage<string>(
    {
      key: GeminiKey.MODEL,
      instance
    },
    (v) => (v === undefined ? "gemini-pro" : v)
  )

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(GeminiKey.API_KEY)
      if (token && token.length > 0) {
        setShow(false)
      } else {
        setShow(true)
      }
    }
    main()
  }, [])

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value)
  }
  const handleModelChange = (event) => {
    setModel(event.target.value)
  }

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnableChange(event.target.checked)
  }
  return (
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary aria-controls="gemini-content" id="gemini-header">
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Typography>Gemini</Typography>
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
              sx={{ flex: "1 1 auto" }}
              type={show ? "text" : "password"}
              label="API Key:"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <Tooltip
              title={
                <>
                  <Typography variant="body1">
                    Click{" "}
                    <Link
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      color="#ffc107"
                      rel="noreferrer">
                      This
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
            label="Model:"
            disabled
            value={model}
            onChange={handleModelChange}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
