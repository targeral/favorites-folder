import { Box, Card, CardContent, TextField, Typography } from "@mui/material"
import { useStorage } from "@plasmohq/storage/hook"
import { GeneralSetting, getStorage } from "~storage/index"

const instance = getStorage()

const Settings = () => {
  const [tagCount, setTagCount] = useStorage<number>(
    {
      key: GeneralSetting.GenTagCount,
      instance
    },
    5
  )

  const handleTagCountChange = (event) => {
    setTagCount(event.target.value)
  }

  return (
    <>
      <h1>通用设置</h1>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">标签设置</Typography>
              <TextField
                label="标签生成数量"
                type="number"
                value={tagCount}
                onChange={handleTagCountChange}
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
              />
            </Box>
            {/* 未来更多设置内容可以在这里添加 */}
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default Settings
