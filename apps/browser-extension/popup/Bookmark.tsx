import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Chip, IconButton, Box, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { checkIfBookmarked } from '../chrome-utils';
import { sendToBackground } from '@plasmohq/messaging';
import { useStorage } from '@plasmohq/storage/hook';
import { getStorage, StorageKeyHash } from '~storage/index';
import type { ITagItem } from 'api-types';

const getCurrentTabUrl = async (): Promise<string> => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    return currentTab ? currentTab.url : (document.title || 'New Bookmark');
}

enum BookmarkAction {
  CREATE,
  MODIFY,
  NONE
}

const instance = getStorage();

const BookmarkCard = () => {
  const [bookmarkAction, setBookmarkAction] = useState<BookmarkAction>(BookmarkAction.NONE);
  const [actionText, setActionText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<ITagItem[]>([]);
  const [newTag, setNewTag] = useState<ITagItem>();
  const [editTagIndex, setEditTagIndex] = useState(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [appearFetchTagLoading, setAppearFetchTagLoading] = useState<boolean>(true);

  useEffect(() => {
    const analyzeTags = async ({ url }) => {
      const apiKey = await instance.get(StorageKeyHash.GEMINI_API_KEY);
      console.info('apiKey', apiKey);
      const { data } = await sendToBackground({
        name: 'get-tags',
        body: {
          url,
          apiKey
        }
      });
      console.info('tags', tags);
      setTags(data.tags);
      setAppearFetchTagLoading(false);
    }
    // 使用 document.title 获取当前页面的标题信息
    const main = async () => {
        const currentUrl = await getCurrentTabUrl();
        const isBookmarked = await checkIfBookmarked(currentUrl);
        setTitle(currentUrl);
        setBookmarkAction(isBookmarked ? BookmarkAction.MODIFY : BookmarkAction.CREATE);
        setActionText(isBookmarked ? '修改' : '创建');
        await analyzeTags({ url: currentUrl });
    };
    main();

    // Fetch current bookmark details using chrome.bookmarks API
    // Set title and tags based on fetched data
    
  }, []);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // Update bookmark title using chrome.bookmarks API
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTagDelete = (tagToDelete) => () => {
    // Remove tag from bookmark using chrome.bookmarks API
    setTags((tags) => tags.filter((tag) => tag !== tagToDelete));
  };

  const handleAddTag = () => {
    // Add new tag to bookmark using chrome.bookmarks API
    setTags([...tags, newTag]);
    setNewTag(newTag);
  };

  const handleComplete = () => {
    // Complete bookmark creation or modification
    // TODO: 调用相关接口，同步数据
    window.close();
  };

  const handleRemove = async () => {
    const result = await sendToBackground({
      name: 'remove-bookmark'
    });

    if (result.message) {
      setBookmarkAction(BookmarkAction.CREATE);
    }

  };

  const handleManageClick = () => {
    chrome.runtime.openOptionsPage();
  }

  const handleTagDoubleClick = (index) => () => {
    setEditTagIndex(index);
  };

  const handleTagChange = (index) => (event) => {
    const newTags = [...tags];
    newTags[index].name = event.target.value;
    setTags(newTags);
  };

  const handleTagKeyPress = (index) => (event) => {
    if (event.key === 'Enter') {
      if (!tags[index].name.trim()) {
        // 如果标签为空，则移除它
        setTags((currentTags) => currentTags.filter((_, i) => i !== index));
      }
      setEditTagIndex(null);
    }
  };

  const handleTagBlur = (index) => () => {
    if (!tags[index]) {
      // 如果标签为空，则移除它
      setTags((currentTags) => currentTags.filter((_, i) => i !== index));
    }
    setEditTagIndex(null);
    setIsAddingTag(false);
  };

  const handleAddTagClick = () => {
    setTags([...tags, { name: '', source: 'USER' }]);
    setIsAddingTag(true);
    setEditTagIndex(tags.length);
  };

  return (
    <Card sx={{ width: 448, minHeight: 233 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
            {actionText}
          </Typography>
          {isEditingTitle ? (
            <TextField
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              autoFocus
              fullWidth
              size="small"
              sx={{ maxWidth: 'calc(300px - 48px)' }} // 48px 是操作和结尾内容的宽度估算
            />
          ) : (
            <Typography onClick={handleTitleClick} variant="subtitle1" component="span" noWrap sx={{ maxWidth: 'calc(300px - 48px)' }}>
              {title}
            </Typography>
          )}
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
            书签
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          当前书签的推荐分类为：
        </Typography>
        {/* <div> */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 2 }}>
            { 
              appearFetchTagLoading ? <CircularProgress size={30} /> : (
                <>
                {tags.map((tag, index) => (
                  <div key={index} onDoubleClick={handleTagDoubleClick(index)}>
                    {editTagIndex === index ? (
                      <TextField
                        value={tag.name}
                        onChange={handleTagChange(index)}
                        onBlur={handleTagBlur(index)}
                        onKeyDown={handleTagKeyPress(index)}
                        autoFocus
                        size="small"
                        sx={{ width: 100 }}
                      />
                    ) : (
                      <Chip
                        label={tag.name} onDelete={handleTagDelete(tag)} 
                        // onDoubleClick={handleTagDoubleClick(index)}
                      />
                    )}
                  </div>
                  // <Chip
                  //   key={index}
                  //   label={tag}
                  //   onDelete={handleTagDelete(tag)}
                  //   deleteIcon={<CloseIcon />}
                  //   sx={{ mr: 1, mt: 1 }}
                  // />
                ))}
                <IconButton onClick={handleAddTagClick} size="small">
                  <AddIcon />
                </IconButton>
                </>
              )
            }
            </Box>
          
        {/* </div> */}
        {/* <div>
          <TextField
            value={newTag}
            onChange={handleNewTagChange}
            placeholder="添加分类"
            size="small"
            sx={{ mt: 1 }}
          />
        </div> */}
      </CardContent>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={handleManageClick}>
          管理书签
        </Button>
        <Box display="flex" alignItems="center" gap={2}>
          { 
            bookmarkAction === BookmarkAction.MODIFY 
              ? <Button variant="contained" color='warning'  onClick={handleRemove}>移除</Button> 
              : null
          }
          <Button variant="contained" onClick={handleComplete}>
            完成
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;
