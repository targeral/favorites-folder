import axios from 'axios';

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

  async search() {
    const url = `${this.#baseUrl}/search`;
    const response = await axios({
      method: 'POST',
      url,
      responseType: 'json',
      headers: {
        token:
          'eyJhbGciOiJIUzI1NiJ9.eyJhdXRob3JpdHkiOiIxIiwianRpIjoiMSIsInN1YiI6InF3ZXJ0MTIzNDUlIiwiZXhwIjoxNzExNjQwNDY0fQ.B1rc5ZnIUEYfD6C58ONSwdQ9-kWcikcn4OpVCfDjGvc',
        'Cache-Control': 'no-cache',
      },
    });
    console.info(response);
  }
}
