import { MugunAccount } from "mugun-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"

export interface GenerateDSTokenRequestBody {
  email: string
  password: string
}

export interface GenerateDSTokenResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    token: string
  }
}

const handler: PlasmoMessaging.MessageHandler<
  GenerateDSTokenRequestBody,
  GenerateDSTokenResponseBody
> = async (req, res) => {
  const { email, password } = req.body ?? {}
  const account = new MugunAccount({})
  const {
    status,
    data: { token }
  } = await account.generateToken({ email, password })
  if (status === "success") {
    res.send({
      status: "success",
      data: {
        token
      }
    })
  } else {
    res.send({
      status: "fail",
      message: "生成 token 失败",
      data: { token: "" }
    })
  }
}

export default handler
