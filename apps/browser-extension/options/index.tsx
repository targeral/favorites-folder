import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import Settings from './General';
import BookmarksManager from './BookmarksManager';
import { TagAIModelManager } from './Tag';
import { StorageManager } from './Storage';

const drawerWidth = 240;
const itemMap = {
  BOOKMARKS: '书签',
  STORAGE: '存储设置',
  TAG_AI_MODEL: '标签生成模型',
  SETTING: '通用设置',
};
const items = [itemMap.BOOKMARKS, itemMap.STORAGE, itemMap.TAG_AI_MODEL, itemMap.SETTING];


function ManagerAndSetting() {
  const [currentItem, setCurrentItem] = useState(itemMap.BOOKMARKS);

  const handleItemClick = (itemName: string) => {
    setCurrentItem(itemName);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            管理和设置
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {items.map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton selected={text === currentItem} onClick={() => handleItemClick(text)}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {
          currentItem === itemMap.BOOKMARKS ? <BookmarksManager></BookmarksManager> : null
        }
        {
          currentItem === itemMap.SETTING ? <Settings></Settings> : null
        }
        {
          currentItem === itemMap.TAG_AI_MODEL ? <TagAIModelManager></TagAIModelManager> : null
        }
        {
          currentItem === itemMap.STORAGE ? <StorageManager></StorageManager> : null
        }
      </Box>
    </Box>
  );
}

export default ManagerAndSetting;