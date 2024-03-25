import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button, TextField, DialogActions, Stack, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

type ITagItem = { 
  name: string; 
  source: "AI" | "User";
}

type BookmarkProps = {
  title: string;
  tags: ITagItem[];
  onTagsUpdated: (newTags: ITagItem[]) => void;
}

const BookmarkComponent: React.FC<BookmarkProps> = ({ title, tags, onTagsUpdated }) => {
  const [editMode, setEditMode] = useState(false);
  const [editTags, setEditTags] = useState<ITagItem[]>([]);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    setEditTags(tags);
  }, [tags]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleClose = () => {
    setEditMode(false);
  };

  const handleTagDoubleClick = (index: number) => {
    setEditingTagIndex(index);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
  };

  const handleTagBlur = () => {
    if (editingTagIndex !== null) {
      const updatedTags = [...editTags];
      updatedTags[editingTagIndex] = { ...updatedTags[editingTagIndex], name: newTagName };
      setEditTags(updatedTags);
      setEditingTagIndex(null);
      setNewTagName('');
    }
  };

  const handleTagEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTagBlur();
    }
  };

  const handleAddTag = () => {
    setEditTags([...editTags, { name: '', source: 'User' }]);
    setEditingTagIndex(editTags.length);
  };

  const handleInitializeTags = () => {
    // Initialize tags logic here
  };

  const handleSave = () => {
    onTagsUpdated(editTags);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleEditClick}>
        <EditIcon />
      </IconButton>

      <Dialog open={editMode} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {title}
          <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} alignItems="center">
            {editTags.map((tag, index) => (
              editingTagIndex === index ? (
                <TextField
                  key={index}
                  value={newTagName}
                  onChange={handleTagChange}
                  onBlur={handleTagBlur}
                  onKeyDown={handleTagEnter}
                  autoFocus
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Chip 
                  key={index}
                  label={tag.name} 
                  onDoubleClick={() => handleTagDoubleClick(index)} 
                />
              )
            ))}
            <IconButton onClick={handleAddTag}>
              <AddIcon />
            </IconButton>
          </Stack>
        </DialogContent>
        <DialogActions>
          {!editTags.some(tag => tag.source === 'AI') && (
            <Button onClick={handleInitializeTags}>初始化标签</Button>
          )}
          <Button onClick={handleSave}>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookmarkComponent;