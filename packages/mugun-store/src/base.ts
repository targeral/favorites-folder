import ky, { Options as KyOptions } from 'ky';

export interface MugunBaseOptions {
  token?: string;
}

export class MugunBase {
  options: MugunBaseOptions;

  baseUrl: string;

  constructor(options: MugunBaseOptions) {
    this.options = options || {};
    this.baseUrl = BASE_URL;
  }

  async fetch<T>(url: string, options: KyOptions) {
    const response = await ky.post(url, {
      ...options,
      headers: {
        token: this.options.token ?? '',
        'Cache-Control': 'no-cache',
        ...(options.headers ?? {}),
      },
    });
    return response.json<T>();
  }
}
