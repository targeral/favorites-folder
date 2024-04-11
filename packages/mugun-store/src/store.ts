import { BrowserType, IBookmark, ITagItem } from 'api-types';
import dayjs from 'dayjs';
import { MugunBase, type MugunBaseOptions } from './base';

export interface StoreOptions extends MugunBaseOptions {
  token: string;
  browserType: BrowserType;
}

export class MugunStore extends MugunBase {
  options: StoreOptions;

  constructor(options: StoreOptions) {
    super(options);
    this.options = options || {};
  }

  async getBookmarks(): Promise<{
    status: 'success' | 'fail';
    data: { bookmarks: IBookmark[] };
  }> {
    const { browserType } = this.options;
    const url = `${this.baseUrl}/bookmark/search`;

    const { code, data } = await this.fetch<{
      code: number;
      data: {
        id: number;
        website: string;
        title: string;
        tags: [];
        createTime: string;
      }[];
    }>(url, { method: 'post' });
    console.info(this.options.token);
    if (code === 200 && Array.isArray(data)) {
      const bookmarks: IBookmark[] = data.map(bookmark => {
        return {
          id: bookmark.id,
          url: bookmark.website,
          title: bookmark.title,
          tags: bookmark.tags,
          dateAdded: dayjs(bookmark.createTime).valueOf(),
          browserType,
        };
      });
      return {
        status: 'success',
        data: {
          bookmarks,
        },
      };
    }

    return {
      status: 'fail',
      data: {
        bookmarks: [],
      },
    };
  }

  async updateBookmark(bookmark: IBookmark): Promise<{
    status: 'success' | 'fail';
  }> {
    const { browserType } = this.options;
    const url = `${this.baseUrl}/bookmark/update`;
    const data = {
      website: bookmark.url,
      tags: bookmark.tags,
      title: bookmark.title,
      id: bookmark.id,
      browserType,
    };
    console.info('data', data);
    const result = await this.fetch<{ code: number }>(url, {
      json: data,
    });

    const { code } = result;
    if (code === 200) {
      return {
        status: 'success',
      };
    }

    return {
      status: 'fail',
    };
  }

  async addBookmarks(bookmarks: IBookmark[]): Promise<{
    status: 'success' | 'fail';
  }> {
    const { browserType } = this.options;
    const url = `${this.baseUrl}/bookmark/insert`;
    const data = bookmarks.map(bookmark => ({
      website: bookmark.url,
      tags: bookmark.tags,
      title: bookmark.title,
      id: bookmark.id,
      browserType,
    }));
    const result = await this.fetch<{ code: number }>(url, {
      json: data,
    });

    const { code } = result;
    if (code === 200) {
      return {
        status: 'success',
      };
    }

    return {
      status: 'fail',
    };
  }

  async removeBookmarkById({ id }: { id: string }): Promise<{
    status: 'success' | 'fail';
  }> {
    const url = `${this.baseUrl}/bookmark/delete`;
    const data = { id };
    const result = await this.fetch<{ code: number }>(url, {
      json: data,
    });

    const { code } = result;
    if (code === 200) {
      return {
        status: 'success',
      };
    }

    return {
      status: 'fail',
    };
  }

  async getTagsByKeyword({ keyword }: { keyword: string }): Promise<{
    status: 'success' | 'fail';
    data: {
      tags: ITagItem[];
    };
  }> {
    const { browserType } = this.options;
    const url = `${this.baseUrl}/tags/searchTagsByInfo`;
    const result = await this.fetch<{ code: number; data: ITagItem[] }>(url, {
      json: { keyword, browserType },
    });

    const { code, data: tags } = result;
    if (code === 200) {
      return {
        status: 'success',
        data: {
          tags,
        },
      };
    }

    return {
      status: 'fail',
      data: {
        tags: [],
      },
    };
  }

  async getTagsByUrl({ url: website }: { url: string }): Promise<{
    status: 'success' | 'fail';
    data: {
      tags: ITagItem[];
    };
  }> {
    const { browserType } = this.options;
    const url = `${this.baseUrl}/tags/searchTagsByWebsite`;
    const result = await this.fetch<{ code: number; data: ITagItem[] }>(url, {
      json: { website, browserType },
    });

    const { code, data: tags } = result;
    if (code === 200) {
      return {
        status: 'success',
        data: {
          tags,
        },
      };
    }

    return {
      status: 'fail',
      data: {
        tags: [],
      },
    };
  }
}
