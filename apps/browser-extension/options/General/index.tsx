import * as React from 'react';
import { Box, Card, CardContent, Typography } from "@mui/material"

import { useStorage } from "@plasmohq/storage/hook"
import { GeneralSetting, getStorage } from "~storage/index"
import { NumberInput, type OnChange } from '../components/NumberInput';

const instance = getStorage()

const Settings = () => {
  const [tagMaxCount, setTagMaxCount] = useStorage<number>(
    {
      key: GeneralSetting.BookmarkTagsCount,
      instance
    },
    5
  )

  const handleTagCountChange: OnChange = (value) => {
    setTagMaxCount(value)
  }

  return (
    <>
      <h1>通用设置</h1>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">标签设置</Typography>
              <NumberInput
                label="书签的标签/Tag 数量"
                value={tagMaxCount}
                onChange={handleTagCountChange}
                max={5}
                min={0}
              ></NumberInput>
            </Box>
            {/* 未来更多设置内容可以在这里添加 */}
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default Settings
