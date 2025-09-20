import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  host: '103.94.238.6',
  port: 5432,
  user: 'odoo16',
  password: 'p3r3str01k4',
  database: 'hcml_backup',
  ssl: false, // Set to true if SSL is required
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// User interface
export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

// Database queries
export class UserDatabase {
  // Get user by username
  static async getUserByUsername(username: string): Promise<DatabaseUser | null> {
    try {
      const query = `
        SELECT id, username, email, password_hash, role, status, 
               created_at, updated_at, last_login
        FROM users 
        WHERE username = $1 AND status = 'active'
      `;
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<DatabaseUser | null> {
    try {
      const query = `
        SELECT id, username, email, password_hash, role, status, 
               created_at, updated_at, last_login
        FROM users 
        WHERE id = $1 AND status = 'active'
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(userId: number): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET last_login = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      await pool.query(query, [userId]);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Create user table if not exists
  static async createUserTable(): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'viewer',
          status VARCHAR(10) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      `;
      await pool.query(query);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  // Insert default admin user
  static async insertDefaultUser(): Promise<void> {
    try {
      // Check if admin user exists
      const existingUser = await this.getUserByUsername('alugara');
      if (existingUser) {
        console.log('Default admin user already exists');
        return;
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('alugara', 10);

      const query = `
        INSERT INTO users (username, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
      `;
      await pool.query(query, [
        'alugara',
        'admin@alugara.com',
        hashedPassword,
        'admin',
        'active'
      ]);
      console.log('Default admin user created');
    } catch (error) {
      console.error('Error creating default user:', error);
      throw error;
    }
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    await UserDatabase.createUserTable();
    await UserDatabase.insertDefaultUser();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}