import { Box, Switch, TextField, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, GeminiKey } from "~storage/index"

import { Accordion, AccordionDetails, AccordionSummary } from "../components/Accordion"

const instance = getStorage()

export interface GeminiSettingProps {
  enable?: boolean;
  onEnableChange?: (enable: boolean) => void;
}

export const GeminiSetting = ({ enable = false, onEnableChange }: GeminiSettingProps) => {
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
    "gemini-pro"
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
      <AccordionSummary aria-controls="github-content" id="github-header">
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
          <TextField
            type={show ? "text" : "password"}
            label="API Key:"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
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
