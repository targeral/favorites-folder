import Box from "@mui/material/Box"
import { useEffect, useState } from "react"
import {
  Route,
  HashRouter as Router,
  Routes,
  useNavigate,
  Navigate
} from "react-router-dom"

import { getStorage, StorageServer, TagAIServer } from "~storage"

import BookmarksManager from "./BookmarksManager"
import {
  InitDialog,
  type InitType,
  type OnGoToSettingPage
} from "./components/InitDialog"
import { LeftNav, drawerWidth } from "./components/LeftNav"
import Settings from "./General"
import { StorageManager } from "./Storage"
import { TagAIModelManager } from "./Tag"

function ManagerAndSetting() {
  const [openInitDialog, setOpenInitDialog] = useState<boolean>(false)
  const [initType, setInitType] = useState<InitType>("none")
  const navigate = useNavigate()

  useEffect(() => {
    const main = async () => {
      const instance = getStorage()
      const storageServer = await instance.get(StorageServer)
      const aiServer = await instance.get(TagAIServer)
      console.info(aiServer, storageServer)
      if (!storageServer && !aiServer) {
        setInitType("all")
        setOpenInitDialog(true)
      } else if (!storageServer && aiServer) {
        setInitType("storage-server")
        setOpenInitDialog(true)
      } else if (!aiServer && storageServer) {
        setInitType("ai-server")
        setOpenInitDialog(true)
      }
    }
    main()
  }, [])

  const handleGoToSetPage: OnGoToSettingPage = (type) => {
    if (type === "storage-server") {
      navigate("/storage")
    } else if (type === "ai-server") {
      navigate("/tags");
    }
    setOpenInitDialog(false)
  }

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <LeftNav></LeftNav>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` }
          }}>
          <Routes>
              <Route path="/" element={<Navigate replace to="bookmarks" />} />
              <Route path="bookmarks" element={<BookmarksManager />} />
              <Route path="common" element={<Settings />} />
              <Route path="tags" element={<TagAIModelManager />} />
              <Route path="storage" element={<StorageManager />} />
            {/* 可以根据需要添加更多的路由 */}
          </Routes>
        </Box>
      </Box>
      <InitDialog
        open={openInitDialog}
        type={initType}
        onGoToSettingPage={handleGoToSetPage}></InitDialog>
    </>
  )
}

export { ManagerAndSetting };
