import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField
} from "@mui/material"
import { MugunStore } from "mugun-store"
import { useEffect, useRef } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { getStorage, StorageKeyHash } from "~storage/index"

const instance = getStorage()

export const StoreManager = () => {
  const store = useRef<MugunStore>()
  const [mugunStoreToken, setMugunStoreToken] = useStorage<string>({
    key: StorageKeyHash.MUGUN_STORE_TOKEN,
    instance
  })

  const handleMugunTokenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMugunStoreToken(e.target.value)
  };
  const handleTest = async () => {
    await store.current.search();
  };

  useEffect(() => {
    if (mugunStoreToken && !store.current) {
      store.current = new MugunStore({ token: mugunStoreToken })
    }
  }, [mugunStoreToken]);
  return (
    <div>
      <TextField
        label="mugun token"
        variant="outlined"
        value={mugunStoreToken}
        onChange={handleMugunTokenChange}
      />

      <Button onClick={handleTest}>测试接口</Button>
    </div>
  )
}
