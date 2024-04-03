import { Box, Switch, TextField, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, DefaultStorageKey } from "~storage/index"

import { Accordion, AccordionDetails, AccordionSummary } from "../components/Accordion"

const instance = getStorage()

export interface DefaultServerSettingProps {
  enable?: boolean;
  onEnableChange?: (enable: boolean) => void;
}

export const DefaultStorageSetting = ({ enable, onEnableChange }: DefaultServerSettingProps) => {
  const [showToken, setShowToken] = useState<boolean>(false)
  const [token, _setToken, { setRenderValue: setToken, setStoreValue: saveToken }] = useStorage<string>(
    {
      key: DefaultStorageKey.TOKEN,
      instance
    },
    v => v === undefined ? '' : v
  );

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

  const handleTokenChange = (event) => {
    setToken(event.target.value)
  }

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnableChange && onEnableChange(event.target.checked)
  }

  const save = () => {
    saveToken(token);
  };

  return (
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary aria-controls="default-server-content" id="default-server-header">
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Typography>Default Server</Typography>
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
  )
}
