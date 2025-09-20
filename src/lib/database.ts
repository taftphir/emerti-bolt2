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

// Vessel interface for database
export interface DatabaseVessel {
  id: number;
  name: string;
  vessel_type: string;
  status: string;
  owner: string;
  vessel_key: string;
  image_url?: string;
  vts_active: boolean;
  ems_active: boolean;
  fms_active: boolean;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  rpm_portside?: number;
  rpm_starboard?: number;
  rpm_center?: number;
  fuel_consumption?: number;
  created_at: Date;
  updated_at: Date;
}

// Vessel database operations
export class VesselDatabase {
  // Get all vessels
  static async getAllVessels(): Promise<DatabaseVessel[]> {
    try {
      const query = `
        SELECT id, name, vessel_type, status, owner, vessel_key, image_url,
               vts_active, ems_active, fms_active, latitude, longitude,
               speed, heading, rpm_portside, rpm_starboard, rpm_center,
               fuel_consumption, created_at, updated_at
        FROM vessel_vessel 
        WHERE status != 'deleted'
        ORDER BY name ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching vessels:', error);
      throw error;
    }
  }

  // Get vessel by ID
  static async getVesselById(id: number): Promise<DatabaseVessel | null> {
    try {
      const query = `
        SELECT id, name, vessel_type, status, owner, vessel_key, image_url,
               vts_active, ems_active, fms_active, latitude, longitude,
               speed, heading, rpm_portside, rpm_starboard, rpm_center,
               fuel_consumption, created_at, updated_at
        FROM vessel_vessel 
        WHERE id = $1 AND status != 'deleted'
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching vessel by ID:', error);
      throw error;
    }
  }

  // Update vessel position and sensor data
  static async updateVesselData(id: number, data: {
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    rpm_portside?: number;
    rpm_starboard?: number;
    rpm_center?: number;
    fuel_consumption?: number;
  }): Promise<void> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return;

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE vessel_vessel 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
      `;
      
      await pool.query(query, values);
    } catch (error) {
      console.error('Error updating vessel data:', error);
      throw error;
    }
  }
}

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
        SELECT id, login, signature
        FROM res_users 
        WHERE login = $1
      `;
      const result = await pool.query(query, [username]);
      //console.log('get user');
      console.error('get user ini:', result.rows[0].login);
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
    // await UserDatabase.createUserTable();
    // await UserDatabase.insertDefaultUser();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}