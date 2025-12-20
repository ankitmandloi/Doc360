import { User } from '../../db/database';
declare class UserService {
    getUser(userId: string): Omit<User, 'password'> | null;
    addBalance(userId: string, amount: number): Omit<User, 'password'> | null;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=user.service.d.ts.map