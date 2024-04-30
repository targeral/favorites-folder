// import axios from 'axios';
import Fuse from 'fuse.js';
import debugFactory from 'debug';
import type { BrowserType, IBookmark, ITagItem } from 'api-types';
import { Github, GithubOptions } from './github';
import { transformBookmarksToString } from './utils';

export interface IGithubStorageOptions extends GithubOptions {
  storageFolder: string;
  filename: string;
  branch: string;
  browserType: BrowserType;
}

export const debug = debugFactory('GITHUB_STORAGE');

export class GithubStorage extends Github {
  storageOptions: IGithubStorageOptions;

  constructor(options: IGithubStorageOptions) {
    super(options);
    this.storageOptions = options || {};
  }

  getBrowserTypeFolder = () => {
    const { browserType } = this.storageOptions;
    switch (browserType) {
      case '1':
        return 'chrome';
      case '2':
        return 'edge';
      case '0':
        return 'other';
      default:
        return 'unknown';
    }
  };

  getFilePath() {
    const { storageFolder, filename } = this.storageOptions;
    const browserFolder = this.getBrowserTypeFolder();
    return `${storageFolder}/${browserFolder}/${filename}`;
  }

  async addBookmarks(additionalBookmarks: IBookmark[]): Promise<{
    status: 'success' | 'fail';
    error: string;
  }> {
    const filePath = this.getFilePath();
    const result = await this.getContentByFilePath({
      filePath,
      branch: 'main',
    });

    if (result.content) {
      const bookmarks = JSON.parse(result.content);
      bookmarks.push(...additionalBookmarks);

      const jsonString = transformBookmarksToString(bookmarks);
      try {
        await this.updateContentByFilePath({
          updateContent: jsonString,
          filePath,
          branch: this.storageOptions.branch,
          message: 'add new bookmark',
        });
        return { status: 'success', error: '' };
      } catch (e) {
        return { status: 'fail', error: JSON.stringify(e) };
      }
    }

    return {
      status: 'fail',
      error: `未获取到${this.getFilePath()}文件数据`,
    };
  }

  async removeBookmarkById({ id }: { id: string | number }): Promise<{
    status: 'success' | 'fail';
    message?: string;
  }> {
    const { status, bookmarks } = await this.getBookmarks();
    if (status === 'fail') {
      return {
        status: 'fail',
        message: 'Get bookmarks fail',
      };
    }

    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);
    console.info('bookmarkIndex', bookmarkIndex);

    if (bookmarkIndex === -1) {
      return {
        status: 'fail',
        message: 'Can`t find this bookmark',
      };
    }

    const updatedBookmarks = [...bookmarks];
    updatedBookmarks.splice(bookmarkIndex, 1);
    const result = await this.syncBookmarks(updatedBookmarks);

    if (result.message === 'success') {
      return {
        status: 'success',
      };
    }

    return {
      status: 'fail',
    };
  }

  async getBookmarks(): Promise<{
    status: 'success' | 'fail';
    message?: string;
    bookmarks: IBookmark[];
  }> {
    // const base = 'https://raw.githubusercontent.com/';
    // const url = `${base}/${this.options.owner}/${this.options.repo}/${
    //   this.storageOptions.branch
    // }/${this.getFilePath()}`;

    // const response = await axios({
    //   method: 'GET',
    //   url,
    //   responseType: 'json',
    // });
    const filePath = this.getFilePath();
    const result = await this.getContentByFilePath({
      filePath,
      branch: 'main',
    });
    if (result.content) {
      const bookmarks = JSON.parse(result.content);
      return {
        status: 'success',
        bookmarks,
      };
    }

    return {
      status: 'fail',
      bookmarks: [],
      message: `未获取到${this.getFilePath()}文件数据`,
    };
    // debug(response);
    // if (response.status === 200) {
    //   return {
    //     status: 'success',
    //     bookmarks: response.data,
    //   };
    // }

    // return {
    //   status: 'fail',
    //   message: JSON.stringify(response.data),
    //   bookmarks: [],
    // };
  }

  async getTagsByUrl({ url }: { url: string }): Promise<{
    status: 'success' | 'fail';
    tags: ITagItem[];
    message?: string;
  }> {
    const { status, bookmarks } = await this.getBookmarks();
    if (status === 'fail') {
      return {
        status: 'fail',
        tags: [],
        message: 'Get bookmarks fail',
      };
    }

    const bookmark = bookmarks.find(bookmark => bookmark.url === url);

    if (!bookmark) {
      return {
        status: 'fail',
        tags: [],
        message: 'Can`t find this bookmark',
      };
    }

    return {
      status: 'success',
      tags: bookmark.tags,
    };
  }

  async getTagsByKeyword({ keyword }: { keyword: string }): Promise<{
    status: 'success' | 'fail';
    tags: ITagItem[];
    message?: string;
  }> {
    const { status, bookmarks } = await this.getBookmarks();
    if (status === 'fail') {
      return {
        status: 'fail',
        tags: [],
        message: 'Get bookmarks fail',
      };
    }

    const map = new Map<string, ITagItem>();
    const tags = bookmarks.flatMap(bookmark => bookmark.tags);
    console.info('tags', tags);
    for (const tag of tags) {
      if (!map.has(tag.name)) {
        map.set(tag.name, tag);
      }
    }
    const allTags = Array.from(map.values());
    console.info('allTags', allTags);

    if (keyword.trim() === '') {
      return {
        status: 'success',
        tags: allTags,
      };
    }

    const fuse = new Fuse(allTags, {
      keys: ['name'],
    });

    const result = fuse.search(keyword);
    console.info('result', result);

    const searchedTags = result.map(r => r.item);
    return {
      status: 'success',
      tags: searchedTags,
    };
  }

  async modifyBookmarkByUrl({
    url,
    newTags,
    title,
  }: {
    url: string;
    newTags?: ITagItem[];
    title?: string;
  }): Promise<{
    status: 'success' | 'fail';
    message?: string;
  }> {
    const { status, bookmarks } = await this.getBookmarks();
    if (status === 'fail') {
      return {
        status: 'fail',
        message: 'Get bookmarks fail',
      };
    }

    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === url);
    console.info('bookmarkIndex', bookmarkIndex);

    if (bookmarkIndex === -1) {
      return {
        status: 'fail',
        message: 'Can`t find this bookmark',
      };
    }

    if (title && bookmarks[bookmarkIndex].title !== title) {
      bookmarks[bookmarkIndex].title = title;
    }
    if (newTags) {
      bookmarks[bookmarkIndex].tags = newTags;
    }
    const result = await this.syncBookmarks(bookmarks);

    if (result.message === 'success') {
      return {
        status: 'success',
      };
    }

    return {
      status: 'fail',
    };
  }

  async syncBookmarks(bookmarks: IBookmark[]) {
    const jsonString = transformBookmarksToString(bookmarks);
    const filePath = this.getFilePath();
    const { branch } = this.storageOptions;

    const result = await this.checkFilePathExistAndReturnContentData({
      filePath,
      branch,
    });

    if (result.exist) {
      // 更新内容
      return await this.updateContentByFilePath({
        updateContent: jsonString,
        contentData: result.data,
        filePath,
        branch,
      });
    } else {
      // 初始化文件
      return await this.gitCommitAndPush({
        content: jsonString,
        filePath,
        branch,
      });
    }
  }

  async initStorage(initBookmarks: IBookmark[] = []): Promise<{
    status: 'success' | 'fail';
    bookmarks: IBookmark[];
    message?: string;
  }> {
    const filePath = this.getFilePath();
    const { branch } = this.storageOptions;

    const content = transformBookmarksToString(initBookmarks);
    const gitInitResult = await this.gitInitFile({
      filePath,
      content,
      branch,
      message: 'init storage file',
    });
    if (gitInitResult.status === 'fail') {
      return {
        status: 'fail',
        bookmarks: [],
        message: gitInitResult.message,
      };
    }

    return {
      status: 'success',
      bookmarks: [],
      message: '',
    };
  }
}
