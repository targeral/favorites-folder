import { Box, Button, TextField } from "@mui/material"
import React, { useState } from "react"

const Feedback = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [githubName, setGithubName] = useState("")
  const [feedbackText, setFeedbackText] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()

    // 构建issue内容
    const issueBody = `
Username: ${username}
Email: ${email}
Github: ${githubName}
Feedback: ${feedbackText}
    `

    // GitHub API endpoint
    const GITHUB_API_URL = "https://api.github.com/repos/example/example/issues"
    const GITHUB_TOKEN = "your_github_token" // 请替换成你的GitHub token

    try {
    //   const response = await ky.post(GITHUB_API_URL, {
    //     json: {
    //       title: `Feedback from ${username}`,
    //       body: issueBody
    //     },
    //     headers: {
    //       Authorization: `token ${GITHUB_TOKEN}`,
    //       Accept: "application/vnd.github.v3+json"
    //     }
    //   })

    //   if (response.status === 201) {
    //     alert("Feedback submitted successfully")
    //     // 清空表单
    //     setUsername("")
    //     setEmail("")
    //     setGithubName("")
    //     setFeedbackText("")
    //   }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Error submitting feedback")
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="githubName"
        label="GitHub Username"
        name="githubName"
        autoComplete="githubName"
        value={githubName}
        onChange={(e) => setGithubName(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="feedbackText"
        label="Your Feedback"
        name="feedbackText"
        autoComplete="feedbackText"
        multiline
        rows={4}
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Submit Feedback
      </Button>
    </Box>
  )
}

export { Feedback }
