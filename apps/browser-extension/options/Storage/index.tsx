import { Box } from "@mui/material"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { EnableFeatureValue } from "~constants"
import { EnableFeature, getStorage } from "~storage/index"

import { DefaultStorageSetting } from "./Default"
import { GithubStorageSetting } from "./Github"

const instance = getStorage()

export const StorageManager = () => {
  const [enableFeature, setEnableFeature] = useStorage<string>(
    {
      key: EnableFeature,
      instance
    },
    ""
  )

  const handleEnableChange = (enable: boolean, trigger: string) => {
    if (enable) {
      setEnableFeature(trigger)
    } else {
      setEnableFeature("")
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
          enable={enableFeature === EnableFeatureValue.GITHUB}
          onEnableChange={(enable) =>
            handleEnableChange(enable, EnableFeatureValue.GITHUB)
          }></GithubStorageSetting>
        <DefaultStorageSetting
          enable={enableFeature === EnableFeatureValue.DEFAULT_SERVER}
          onEnableChange={(enable) =>
            handleEnableChange(enable, EnableFeatureValue.DEFAULT_SERVER)
          }></DefaultStorageSetting>
      </Box>
    </>
  )
}
