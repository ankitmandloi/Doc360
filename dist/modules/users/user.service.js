"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const database_1 = require("../../db/database");
class UserService {
    getUser(userId) {
        const user = database_1.db.getUser(userId);
        if (!user)
            return null;
        // Return without password
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    addBalance(userId, amount) {
        const user = database_1.db.updateUserBalance(userId, amount);
        if (!user)
            return null;
        // Return without password
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
}
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map