import type { IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"
import { findBookmarkByUrl } from "~chrome-utils"

export interface BookmarkUpdateByUrlRequestBody {
  url: string;
  tags?: ITagItem[];
  title?: string;
}

export interface BookmarkUpdateByUrlResponseBody {
  status: "success" | "fail"
  message?: string
}

const updateBookmarkFromGithub = async (
  { instance }: { instance: Storage },
  { id, newTags, title }: { id: string; newTags?: ITagItem[]; title?: string }
): Promise<BookmarkUpdateByUrlResponseBody> => {
  const email = await instance.get(GithubStorageKey.EMAIL)
  const token = await instance.get(GithubStorageKey.TOKEN)
  const owner = await instance.get(GithubStorageKey.OWNER)
  const repo = await instance.get(GithubStorageKey.REPO)

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: "favorites",
    filename: "data.json",
    branch: "main"
  })
  const result = await gs.modifyBookmarkById({ id, newTags, title })
  return result
}

const updateBookmarkFromDefaultServer = async (
  {
    instance
  }: {
    instance: Storage
  },
  updatedBookmark: IBookmark
): Promise<BookmarkUpdateByUrlResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token })
  const result = await ms.updateBookmark(updatedBookmark)
  return result
}

const handler: PlasmoMessaging.MessageHandler<
  BookmarkUpdateByUrlRequestBody,
  BookmarkUpdateByUrlResponseBody
> = async (req, res) => {
  const { url, tags, title } = req.body
  const { id, dateAdded } = await findBookmarkByUrl(url);
  const updatedBookmark: IBookmark = {
    tags,
    title,
    url,
    id,
    dateAdded,
  }

  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: BookmarkUpdateByUrlResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await updateBookmarkFromGithub(
      { instance },
      {
        id: String(updatedBookmark.id),
        newTags: updatedBookmark.tags,
        title: updatedBookmark.title
      }
    )
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await updateBookmarkFromDefaultServer({instance}, updatedBookmark);
  }

  res.send(result)
}

export default handler
