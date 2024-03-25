import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Chip, Button, TextField, DialogActions, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
// import EditIcon from '@mui/icons-material/EditSharp';
// import EditIcon from 'react:~/assets/edit.svg';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { ITagItem } from 'api-types';


type BookmarkProps = {
  title: string;
  tags: ITagItem[];
  onTagsUpdated?: (newTags: ITagItem[]) => void;
}

const BookmarkEditor: React.FC<BookmarkProps> = ({ title, tags, onTagsUpdated }) => {
  const [editMode, setEditMode] = useState(false);
  const [editTags, setEditTags] = useState<ITagItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<ITagItem | null>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (selectedTag) {
      setEditTags(editTags.map(tag => tag === selectedTag ? { ...tag, name: e.target.value } : tag));
    }
  };

  const handleTagBlur = () => {
    setSelectedTag(null);
    onTagsUpdated(editTags);
  };

  const handleTagEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleAddTag = () => {
    const newTag: ITagItem = { name: '', source: 'USER' };
    setEditTags([...editTags, newTag]);
    setSelectedTag(newTag);
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
          <Stack direction="row" spacing={1}>
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

export { BookmarkEditor };