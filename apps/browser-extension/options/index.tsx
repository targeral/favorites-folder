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

import Settings from './setting';

import BookmarksManager from './bookmarks-manager';

const drawerWidth = 240;
const itemMap = {
  BOOKMARKS: '书签',
  STORAGE: '存储',
  SETTING: '设置'
};
const items = [itemMap.BOOKMARKS, itemMap.STORAGE, itemMap.SETTING];


function ManagerAndSetting() {
  const [data, setData] = useState("");
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
                <ListItemButton onClick={() => handleItemClick(text)}>
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
        <Toolbar />
        {/* Add your content here */}
        {/* <Box>
          This is the main content area
        </Box> */}
        {
          currentItem === itemMap.BOOKMARKS ? <BookmarksManager></BookmarksManager> : null
        }
        {
          currentItem === itemMap.SETTING ? <Settings></Settings> : null
        }
      </Box>
    </Box>
  );
}

export default ManagerAndSetting;