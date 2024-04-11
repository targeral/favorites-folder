import ky from "ky"
import type { PlasmoMessaging } from "@plasmohq/messaging"

export interface GithubIssueRequestBody {
  name: string
  email: string
  feedbackText: string
}

export interface ResponseBody {
  status: "success" | "fail"
  message?: string
}

// const sendIssue = async (
//   options: GithubIssueRequestBody
// ): Promise<ResponseBody> => {
//   const { name, email, feedbackText } = options
//   // 构建issue内容
//   const issueBody = `
//         Name: ${name}
//         Email: ${email}
//         Feedback: ${feedbackText}
//             `
//   // GitHub API endpoint
//   const repoName = 'targeral/favorite'
//   const GITHUB_API_URL = `https://api.github.com/repos/${}/issues`;
//   const GITHUB_TOKEN = "your_github_token" // 请替换成你的GitHub token

//   try {
//     const response = await ky.post(GITHUB_API_URL, {
//       json: {
//         title: `Feedback from ${name}`,
//         body: issueBody
//       },
//       headers: {
//         Authorization: `token ${GITHUB_TOKEN}`,
//         Accept: "application/vnd.github.v3+json"
//       }
//     })

//     if (response.status === 201) {
//       alert("Feedback submitted successfully")
//       // 清空表单
//       setUsername("")
//       setEmail("")
//       setGithubName("")
//       setFeedbackText("")
//     }
//   } catch (error) {
//     console.error("Error submitting feedback:", error)
//     alert("Error submitting feedback")
//   }
// }

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
//   const message = await querySomeApi(req.body.id)

  res.send({
    message: ''
  })
}

export default handler
