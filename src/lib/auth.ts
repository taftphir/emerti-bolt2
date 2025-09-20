import bcrypt from 'bcryptjs';
import { UserDatabase, DatabaseUser } from './database';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLogin: Date | null;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

export class AuthService {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  private static sessionTimer: NodeJS.Timeout | null = null;

  // Login user
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      // Get user from database
      const dbUser = await UserDatabase.getUserByUsername(username);
      if (!dbUser) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Update last login
      await UserDatabase.updateLastLogin(dbUser.id);

      // Create user object
      const user: AuthUser = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        lastLogin: new Date()
      };

      // Generate session token
      const token = this.generateSessionToken(user);

      // Store session
      this.storeSession(user, token);

      // Start session timeout
      this.startSessionTimeout();

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  // Generate session token
  private static generateSessionToken(user: AuthUser): string {
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: Date.now()
    };
    return btoa(JSON.stringify(sessionData));
  }

  // Store session in localStorage
  private static storeSession(user: AuthUser, token: string): void {
    const sessionData = {
      user,
      token,
      loginTime: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
  }

  // Get current session
  static getCurrentSession(): { user: AuthUser; token: string } | null {
    try {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return {
        user: session.user,
        token: session.token
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Refresh session
  static refreshSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      const newExpiresAt = Date.now() + this.SESSION_TIMEOUT;
      const sessionData = {
        user: session.user,
        token: session.token,
        loginTime: Date.now(),
        expiresAt: newExpiresAt
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      this.startSessionTimeout();
    }
  }

  // Start session timeout
  private static startSessionTimeout(): void {
    // Clear existing timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    // Set new timer
    this.sessionTimer = setTimeout(() => {
      this.logout();
      // Show session expired message
      alert('Your session has expired. Please log in again.');
      window.location.reload();
    }, this.SESSION_TIMEOUT);
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('userSession');
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Get current user
  static getCurrentUser(): AuthUser | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }
}

// Activity tracker for session refresh
export class ActivityTracker {
  private static lastActivity = Date.now();
  private static activityTimer: NodeJS.Timeout | null = null;

  static init(): void {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true);
    });

    // Start activity monitoring
    this.startActivityMonitoring();
  }

  private static updateActivity(): void {
    this.lastActivity = Date.now();
    
    // Refresh session if user is active
    if (AuthService.isAuthenticated()) {
      AuthService.refreshSession();
    }
  }

  private static startActivityMonitoring(): void {
    this.activityTimer = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      const maxInactiveTime = 5 * 60 * 1000; // 5 minutes

      if (inactiveTime > maxInactiveTime && AuthService.isAuthenticated()) {
        console.log('User inactive for too long, logging out...');
        AuthService.logout();
        window.location.reload();
      }
    }, 60000); // Check every minute
  }

  static destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }
}