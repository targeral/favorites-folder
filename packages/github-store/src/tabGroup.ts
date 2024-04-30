import { GithubStorage, IGithubStorageOptions } from './bookmark';
import type { BrowserType, IBookmark, ITabGroup, ITabGroups, ITagItem } from 'api-types';
import { transformDataToString } from './utils';

export class TabGroupGithubStorage extends GithubStorage {
  async addTabGroups(tabGroupList: ITabGroup[]): Promise<{
    status: 'success' | 'fail';
    error: string;
  }> {
    const filePath = this.getFilePath();
    const result = await this.getContentByFilePath({
      filePath,
      branch: 'main',
    });

    if (result.content) {
      const tabGroups: ITabGroups = JSON.parse(result.content);
      for (const tabGroup of tabGroupList) {
        tabGroups[tabGroup.title] = tabGroup;
      }

      const jsonString = transformDataToString(tabGroups);
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

  async modifyTabGroupByTitle({
    queryTitle,
    newTitle,
    bookmarks
  }: {
    queryTitle: string;
    newTitle?: string;
    bookmarks?: IBookmark[];
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

  async getTabGroups(): Promise<{
    status: 'success' | 'fail';
    tabGroups: ITabGroups;
    message?: string;
  }> {
    const filePath = this.getBrowserTypeFolder();
    const result = await this.getContentByFilePath({
      filePath,
      branch: 'main',
    });
    if (result.content) {
      const tabGroups = JSON.parse(result.content);
      return {
        status: 'success',
        tabGroups,
      };
    }

    return {
      status: 'fail',
      tabGroups: {},
      message: `未获取到${this.getFilePath()}文件数据`,
    };
  }
}
