import { MugunBase } from './base';

export class MugunAccount extends MugunBase {
  async generateToken({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{
    status: 'success' | 'fail';
    data: { token: string };
    message?: string;
  }> {
    const url = `${this.baseUrl}/user/login`;
    try {
      const result = await this.fetch<{
        code: number;
        data: string;
        message: string;
      }>(url, {
        json: { email, password },
      });

      const { code, data: token, message } = result;
      if (code === 200) {
        return {
          status: 'success',
          data: {
            token,
          },
        };
      }

      return {
        status: 'fail',
        data: {
          token: '',
        },
        message,
      };
    } catch (e) {
      return {
        status: 'fail',
        data: { token: '' },
        message: JSON.stringify(e),
      };
    }
  }
}
