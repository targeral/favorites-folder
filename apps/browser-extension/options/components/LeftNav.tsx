import { useState } from 'react';
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import {
  useLocation,
  useNavigate
} from "react-router-dom"

const itemMap = {
  BOOKMARKS: "书签",
  STORAGE: "存储设置",
  TAG_AI_MODEL: "标签生成模型",
  SETTING: "通用设置",
  FEEDBACK: '问题反馈'
}

const navItems = [
  { text: itemMap.BOOKMARKS, path: '/bookmarks' },
  { text: itemMap.STORAGE, path: '/storage' },
  { text: itemMap.TAG_AI_MODEL, path: '/tags' },
  { text: itemMap.SETTING, path: '/common' },
  { text: itemMap.FEEDBACK, path: '/feedback'}
];
export const drawerWidth = 240
export const LeftNav = () => {
  const navigate = useNavigate()
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
  }
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box"
        }
      }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          管理和设置
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: "auto" }}>
        <List>
          {navItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleItemClick(item.path)}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
