


import { Box } from "@mui/material"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { TagAIServerValue } from "~constants"
import { TagAIServer, getStorage } from "~storage/index"

import { GeminiSetting } from "./Gemini"

const instance = getStorage()

export const TagAIModelManager = () => {
  const [tagAIServer, setTagAIServer] = useStorage<string>(
    {
      key: TagAIServer,
      instance
    },
    ""
  )

  const handleEnableChange = (enable: boolean, trigger: string) => {
    if (enable) {
      setTagAIServer(trigger)
    } else {
      setTagAIServer("")
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
          enable={tagAIServer === TagAIServerValue.GEMINI}
          onEnableChange={(enable) =>
            handleEnableChange(enable, TagAIServerValue.GEMINI)
          }/>
      </Box>
    </>
  )
}
