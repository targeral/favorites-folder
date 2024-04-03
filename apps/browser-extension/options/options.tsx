import Box from "@mui/material/Box"
import {
  Route,
  // HashRouter as Route,
  Routes,
  Navigate
} from "react-router-dom"

import BookmarksManager from "./BookmarksManager"
import { LeftNav, drawerWidth } from "./components/LeftNav"
import Settings from "./General"
import { StorageManager } from "./Storage"
import { TagAIModelManager } from "./Tag"
import { Feedback } from './Feedback';

function ManagerAndSetting() {
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
              <Route path="feedback" element={<Feedback />} />
            {/* 可以根据需要添加更多的路由 */}
          </Routes>
        </Box>
      </Box>
    </>
  )
}

export { ManagerAndSetting };
