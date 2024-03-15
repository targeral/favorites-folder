import type { PlasmoMessaging } from "@plasmohq/messaging"

const querySomeApi = (id) => {
    console.info(id);
    return { id }
}
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const message = await querySomeApi(req.body.id)
 
  res.send({
    message
  })
}
 
export default handler