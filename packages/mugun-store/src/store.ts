import { IBookmark } from 'api-types';
import ky, { Options as KyOptions } from 'ky';
import dayjs from 'dayjs';

export interface StoreOptions {
  token: string;
}

export class MugunStore {
  options: StoreOptions;

  #baseUrl: string;

  constructor(options: StoreOptions) {
    this.options = options || {};
    this.#baseUrl = BASE_URL;
    console.info('MugunStore', this.options);
  }

  async #fetch<T>(url: string, options: KyOptions) {
    const response = await ky.post(url, {
      ...options,
      headers: {
        token: this.options.token,
        'Cache-Control': 'no-cache',
        ...(options.headers ?? {}),
      },
    });
    return response.json<T>();
  }

  async getBookmarks(): Promise<{
    status: 'success' | 'fail';
    data: { bookmarks: IBookmark[] };
  }> {
    const url = `${this.#baseUrl}/search`;

    const { code, data } = await this.#fetch<{
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
    const url = `${this.#baseUrl}/update`;
    const data = {
      website: bookmark.url,
      tags: bookmark.tags,
      title: bookmark.title,
      id: bookmark.id,
    };
    console.info('data', data);
    const result = await this.#fetch<{ code: number }>(url, {
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

  async addBookmark(bookmarks: IBookmark[]): Promise<{
    status: 'success' | 'fail';
  }> {
    const url = `${this.#baseUrl}/insert`;
    const data = bookmarks.map(bookmark => ({
      website: bookmark.url,
      tags: bookmark.tags,
      title: bookmark.title,
      id: bookmark.id,
    }));
    const result = await this.#fetch<{ code: number }>(url, {
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
    const url = `${this.#baseUrl}/delete`;
    const data = { id };
    const result = await this.#fetch<{ code: number }>(url, {
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
}