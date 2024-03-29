


import { Box } from "@mui/material"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { EnableAIValue } from "~constants"
import { EnableFeature, getStorage } from "~storage/index"

import { GeminiSetting } from "./Gemini"

const instance = getStorage()

export const TagAIModelManager = () => {
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
      <h1>标签生成模型</h1>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center"
        }}>
        <GeminiSetting
          enable={enableFeature === EnableAIValue.Gemini}
          onEnableChange={(enable) =>
            handleEnableChange(enable, EnableAIValue.Gemini)
          }/>
      </Box>
    </>
  )
}
