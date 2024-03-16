import axios from 'axios';
import debugFactory from 'debug';
import type { IBookmark } from 'api-types';
import { Github, GithubOptions } from './github';
import { transformBookmarksToString } from './utils';

export interface IGithubStorageOptions extends GithubOptions {
  storageFolder: string;
  filename: string;
  branch: string;
}

const debug = debugFactory('GITHUB_STORAGE');

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

  async addBookmark(bookmark: IBookmark) {
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

  removeBookmark() {
    // TODO
  }

  modifyBookmark() {
    // TODO
  }

  async getBookmarks() {
    const base = 'https://github.com';
    const url = `${base}/${this.options.owner}/${this.options.repo}/blob/${
      this.#storageOptions.branch
    }/${this.#getFilePath()}`;

    const response = await axios({
      method: 'GET',
      url,
      responseType: 'json',
    });
    debug(response);
  }

  async sync(bookmarks: IBookmark[]) {
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
