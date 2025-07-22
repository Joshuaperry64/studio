// In a real application, you would use a database.
// For this example, we'll use an in-memory store.
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  username: string;
  pinHash: string;
  apiKeyEncrypted?: string;
  role: 'admin' | 'user';
}

// Pre-seed the master admin user
const adminPinHash = bcrypt.hashSync('14235', 10);
const users: User[] = [
  {
    id: 1,
    username: 'Joshua',
    pinHash: adminPinHash,
    role: 'admin'
  }
];
let userIdCounter = 2; // Start after the admin user

export const db = {
  users: {
    findUnique: async ({ where: { id, username } }: { where: { id?: number, username?: string } }) => {
      if (id) {
        return users.find(user => user.id === id);
      }
      if (username) {
        return users.find(user => user.username === username);
      }
      return undefined;
    },
    create: async ({ data }: { data: { username: string; pinHash: string } }) => {
      const newUser: User = {
        id: userIdCounter++,
        username: data.username,
        pinHash: data.pinHash,
        role: 'user', // Default role is 'user'
      };
      users.push(newUser);
      return newUser;
    },
    update: async ({ where: { id }, data }: { where: { id: number }, data: Partial<User>}) => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            return users[userIndex];
        }
        return undefined;
    }
  }
};