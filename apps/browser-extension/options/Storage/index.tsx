import { Box } from "@mui/material"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageServerValue } from "~constants"
import { StorageServer, getStorage } from "~storage/index"

import { DefaultStorageSetting } from "./Default"
import { GithubStorageSetting } from "./Github"

const instance = getStorage()

export const StorageManager = () => {
  const [storageServer, setStorageServer] = useStorage<string>(
    {
      key: StorageServer,
      instance
    },
    ""
  )

  const handleEnableChange = (enable: boolean, trigger: string) => {
    if (enable) {
      setStorageServer(trigger)
    } else {
      setStorageServer("")
    }
  }

  return (
    <>
      <h1>存储设置</h1>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center"
        }}>
        <GithubStorageSetting
          enable={storageServer === StorageServerValue.GITHUB}
          onEnableChange={(enable) =>
            handleEnableChange(enable, StorageServerValue.GITHUB)
          }></GithubStorageSetting>
        <DefaultStorageSetting
          enable={storageServer === StorageServerValue.DEFAULT_SERVER}
          onEnableChange={(enable) =>
            handleEnableChange(enable, StorageServerValue.DEFAULT_SERVER)
          }></DefaultStorageSetting>
      </Box>
    </>
  )
}
