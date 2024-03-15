import { sendToBackground } from '@plasmohq/messaging';
import { GithubStorage } from 'github-store';

import React, { useState } from 'react';

import { Card, CardContent, Typography, TextField, Button, Chip, IconButton, Box, Stack } from '@mui/material';

function Settings() {
    const [token, setToken] = useState<string>();
    const [repo, setRepo] = useState<string>();
    const [owner, setOwner] = useState<string>();
    const [email, setEmail] = useState<string>();

    const handleSyncBookmarkData = async () => {
        const gs = new GithubStorage({
            token,
            repo,
            owner,
            email,
            storageFolder: 'favorites',
            filename: 'data.json',
            branch: 'main'
        });
        const { bookmarks } = await sendToBackground({ name: 'get-bookmarks' });
        await gs.sync(bookmarks);
    };

    const handleTokenChange = (event) => {
        setToken(event.target.value);
    };

    const handleRepoChange = (event) => {
        setRepo(event.target.value);
    };

    const handleOwnerChange = (event) => {
        setOwner(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    

  return (
    <Stack direction="column" spacing={2} alignItems="center">
      <h1>设置</h1>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <TextField label="Github Token:" value={token} onChange={handleTokenChange} />
        <TextField label="Github Repo:" value={repo} onChange={handleRepoChange} />
        <TextField label="Github owner:" value={owner} onChange={handleOwnerChange} />
        <TextField label="Owner email:" value={email} onChange={handleEmailChange} />
      </Box>
      <Button variant="contained" color="primary" onClick={handleSyncBookmarkData}>
        同步
      </Button>
    </Stack>
  );
}

export default Settings;
