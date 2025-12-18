import { db, User } from '../../db/database';

class UserService {
  getUser(userId: string): Omit<User, 'password'> | null {
    const user = db.getUser(userId);
    if (!user) return null;
    
    // Return without password
    const { password: _, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  addBalance(userId: string, amount: number): Omit<User, 'password'> | null {
    const user = db.updateUserBalance(userId, amount);
    if (!user) return null;
    
    // Return without password
    const { password: _, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }
}

export const userService = new UserService();
