import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import {
  Box,
  Card,
  Link,
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              label="Github Repo:"
              value={repo}
              onChange={handleRepoChange}
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
          />
          <TextField
            label="Owner email:"
            value={email}
            onChange={handleEmailChange}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              sx={{ flex: "1 1 auto" }}
              type={showToken ? "text" : "password"}
              label="Github Token:"
              value={token}
              onChange={handleTokenChange}
            />
            <Tooltip
              title={
                <div>
                  <Typography variant="h6">How to get Github Token</Typography>
                  <Typography variant="body1">
                    1. Click on this <Link
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      color="#ffc107"
                      rel="noreferrer">
                      link
                    </Link> to create
                  </Typography>
                  <Typography variant="body1">
                    2. Find on the page: 
                    <Typography sx={{marginLeft: '20px'}} variant="body2">{`=>\n`} "Repository access"</Typography>
                    <Typography sx={{marginLeft: '20px'}} variant="body2">{`=>\n`} "Only select repositories"</Typography>
                    <Typography sx={{marginLeft: '20px'}} variant="body2"> {`=>\n`}"Select Your Repo"</Typography>
                  </Typography>
                </div>
              }>
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
