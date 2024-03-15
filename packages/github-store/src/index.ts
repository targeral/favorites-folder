import axios from 'axios';
import debugFactory from 'debug';
import type { IBookmark } from 'api-types';
import { Github, GithubOptions } from './github';

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

  addBookmark() {
    // TODO
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
    const jsonString = JSON.stringify(bookmarks, undefined, 2);
    const filePath = `${this.#storageOptions.storageFolder}/${
      this.#storageOptions.filename
    }`;

    await this.gitCommitAndPush({
      content: jsonString,
      filePath,
      branch: this.#storageOptions.branch,
    });
  }
}
