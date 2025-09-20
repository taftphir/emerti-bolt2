// Browser mock for pg library
export class Pool {
  constructor(config?: any) {
    console.warn('PostgreSQL Pool is mocked in browser environment');
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.warn('PostgreSQL query is mocked in browser environment');
    return { rows: [] };
  }

  on(event: string, callback: Function) {
    console.warn('PostgreSQL Pool events are mocked in browser environment');
  }

  async end() {
    console.warn('PostgreSQL Pool end is mocked in browser environment');
  }
}

export class Client {
  constructor(config?: any) {
    console.warn('PostgreSQL Client is mocked in browser environment');
  }

  async connect() {
    console.warn('PostgreSQL Client connect is mocked in browser environment');
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.warn('PostgreSQL query is mocked in browser environment');
    return { rows: [] };
  }

  async end() {
    console.warn('PostgreSQL Client end is mocked in browser environment');
  }
}

export default { Pool, Client };