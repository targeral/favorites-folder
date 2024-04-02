import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import {
  Box,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, MoonshotKey } from "~storage/index"

import {
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "../components/Accordion"

const instance = getStorage()

export interface MoonshotSettingProps {
  enable?: boolean
  onEnableChange?: (enable: boolean) => void
}

export const MoonshotSetting = ({
  enable = false,
  onEnableChange
}: MoonshotSettingProps) => {
  const [show, setShow] = useState<boolean>(false)
  const [apiKey, setApiKey] = useStorage<string>(
    {
      key: MoonshotKey.API_KEY,
      instance
    },
    ""
  )
  const [model, setModel] = useStorage<string>(
    {
      key: MoonshotKey.MODEL,
      instance
    },
    (v) => (v === undefined ? "moonshot-v1-32k" : v)
  )

  useEffect(() => {
    const main = async () => {
      const token = await instance.get(MoonshotKey.API_KEY)
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
  const handleModelChange = (event: SelectChangeEvent) => {
    setModel(event.target.value);
  }

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnableChange(event.target.checked)
  }
  return (
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary aria-controls="moonshot-content" id="moonshot-header">
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Typography>Moonshot</Typography>
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
                      href="https://platform.moonshot.cn/console/api-keys"
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
          <FormControl sx={{ marginTop: '10px', minWidth: 120 }}>
            <InputLabel id="model-select-helper-label">Model</InputLabel>
            <Select
              labelId="model-select-helper-label"
              id="demo-simple-select-helper"
              value={model}
              label="Model"
              onChange={handleModelChange}>
              <MenuItem value="moonshot-v1-8k">moonshot-v1-8k</MenuItem>
              <MenuItem value="moonshot-v1-32k">moonshot-v1-32k</MenuItem>
              <MenuItem value="moonshot-v1-128k">moonshot-v1-128k</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
