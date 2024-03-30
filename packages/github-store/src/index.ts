// import axios from 'axios';
import debugFactory from 'debug';
import type { IBookmark, ITagItem } from 'api-types';
import { Github, GithubOptions } from './github';
import { transformBookmarksToString } from './utils';

export interface IGithubStorageOptions extends GithubOptions {
  storageFolder: string;
  filename: string;
  branch: string;
}

export const debug = debugFactory('GITHUB_STORAGE');

export class GithubStorage extends Github {
  #storageOptions: IGithubStorageOptions;

  constructor(options: IGithubStorageOptions) {
    super(options);
    this.#storageOptions = options || {};
  }

  #getFilePath() {
    return `${this.#storageOptions.storageFolder}/${
      this.#storageOptions.filename
    }`;
  }

  async addBookmark(bookmark: IBookmark): Promise<{
    status: 'success' | 'fail';
    error: any;
  }> {
    const filePath = this.#getFilePath();
    const result = await this.getContentByFilePath({
      filePath,
      branch: 'main',
    });

    if (result.content) {
      const bookmarks = JSON.parse(result.content);
      bookmarks.push(bookmark);

      const jsonString = transformBookmarksToString(bookmarks);
      try {
        await this.updateContentByFilePath({
          updateContent: jsonString,
          filePath,
          branch: this.#storageOptions.branch,
          message: 'add new bookmark',
        });
        return { status: 'success', error: null };
      } catch (e) {
        return { status: 'fail', error: e };
      }
    }

    return {
      status: 'fail',
      error: new Error(`未获取到${this.#getFilePath()}文件数据`),
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
    //   this.#storageOptions.branch
    // }/${this.#getFilePath()}`;

    // const response = await axios({
    //   method: 'GET',
    //   url,
    //   responseType: 'json',
    // });
    const filePath = this.#getFilePath();
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
      message: `未获取到${this.#getFilePath()}文件数据`,
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

  async getTagsByBookmarkId({ id }: { id: string | number }): Promise<{
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

    const bookmark = bookmarks.find(bookmark => bookmark.id === id);

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

  async modifyBookmarkById({
    id,
    newTags,
    title,
  }: {
    id: string | number;
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

    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);
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
    const filePath = `${this.#storageOptions.storageFolder}/${
      this.#storageOptions.filename
    }`;
    const { branch } = this.#storageOptions;

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
}
