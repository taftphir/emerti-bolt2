// Browser mock for pg library
import bcrypt from 'bcryptjs';

export class Pool {
  constructor(config?: any) {
    console.warn('PostgreSQL Pool is mocked in browser environment');
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.warn('PostgreSQL query is mocked in browser environment', { text, params });
    
    // Mock user data for authentication
    if (text.includes('SELECT * FROM users WHERE username = $1')) {
      const username = params?.[0];
      if (username === 'alugara') {
        // Pre-hashed password for 'alugara' (bcrypt hash of 'alugara')
        const hashedPassword = await bcrypt.hash('alugara', 10);
        return {
          rows: [{
            id: 1,
            username: 'alugara',
            email: 'admin@alugara.com',
            password_hash: hashedPassword,
            role: 'admin',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            last_login: null
          }]
        };
      }
    }
    
    // Mock table creation queries
    if (text.includes('CREATE TABLE') || text.includes('INSERT INTO')) {
      return { rows: [] };
    }
    
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