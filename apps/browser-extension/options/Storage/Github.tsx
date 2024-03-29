import { Box, Switch, TextField, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, GithubStorageKey } from "~storage/index"

import { Accordion, AccordionDetails, AccordionSummary } from "../components/Accordion"

const instance = getStorage()

export interface GithubStorageSettingProps {
  enable?: boolean;
  onEnableChange?: (enable: boolean) => void;
}

export const GithubStorageSetting = ({ enable = false, onEnableChange }: GithubStorageSettingProps) => {
  const [showToken, setShowToken] = useState<boolean>(false)
  const [token, setToken] = useStorage<string>(
    {
      key: GithubStorageKey.TOKEN,
      instance
    },
    ""
  )
  const [repo, setRepo] = useStorage<string>(
    {
      key: GithubStorageKey.REPO,
      instance
    },
    ""
  )
  const [owner, setOwner] = useStorage<string>(
    {
      key: GithubStorageKey.OWNER,
      instance
    },
    ""
  )
  const [email, setEmail] = useStorage<string>(
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
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
