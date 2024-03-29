import type { PlasmoMessaging } from "@plasmohq/messaging"

const querySomeApi = (id) => {
    console.info(id);
    return { id }
}

export interface RequestBody {
}

export interface ResponseBody {
  status: 'success' | 'fail';
  message?: string;
}
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const message = await querySomeApi(req.body.id)
 
  res.send({
    message
  })
}
 
export default handler