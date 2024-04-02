import BugReportIcon from "@mui/icons-material/BugReport"
import { styled } from "@mui/material"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import React from "react"

// 自定义样式的按钮
const StyledButton = styled(Button)({
  backgroundColor: "#2c3e50",
  color: "#fff",
  padding: "10px 20px",
  margin: "20px",
  "&:hover": {
    backgroundColor: "#34495e"
  }
})

const Feedback = () => {
  return (
    <>
      <h1>问题反馈</h1>
      <Typography variant="body1" gutterBottom>
        反馈方式：
      </Typography>
      <StyledButton
        variant="contained"
        startIcon={<BugReportIcon />}
        onClick={() =>
          window.open(
            "https://github.com/targeral/favorites-folder/issues/new",
            "_blank"
          )
        }>
        GitHub Issue
      </StyledButton>
    </>
  )
}

export { Feedback }
