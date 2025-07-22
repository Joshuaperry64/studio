// In a real application, you would use a database.
// For this example, we'll use an in-memory store.
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  pinHash: string;
  apiKeyEncrypted?: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending';
  avatarDataUri?: string;
}

export interface Feedback {
    id: number;
    userId: number;
    username: string;
    feedback: string;
    createdAt: Date;
}

// Pre-seed the master admin user
const adminPinHash = bcrypt.hashSync('14235', 10);
let users: User[] = [
  {
    id: 1,
    username: 'Joshua',
    pinHash: adminPinHash,
    role: 'admin',
    status: 'approved',
  }
];
let userIdCounter = 2; // Start after the admin user
let feedback: Feedback[] = [];
let feedbackIdCounter = 1;


export const db = {
  users: {
    findMany: async () => {
        return users;
    },
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
        status: 'pending', // New users require approval
      };
      users.push(newUser);
      return newUser;
    },
    update: async ({ where: { id }, data }: { where: { id: number }, data: Partial<Omit<User, 'id' | 'pinHash'>>}) => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            return users[userIndex];
        }
        return undefined;
    },
    delete: async({ where: { id } }: { where: { id: number }}) => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            const deletedUser = users[userIndex];
            // Prevent admin deletion
            if (deletedUser.role === 'admin') {
                throw new Error('Cannot delete administrator account.');
            }
            users.splice(userIndex, 1);
            return deletedUser;
        }
        return undefined;
    }
  },
  feedback: {
      create: async ({ data }: { data: { userId: number, username: string, feedback: string }}) => {
          const newFeedback: Feedback = {
              id: feedbackIdCounter++,
              userId: data.userId,
              username: data.username,
              feedback: data.feedback,
              createdAt: new Date(),
          };
          feedback.push(newFeedback);
          return newFeedback;
      },
      findMany: async () => {
          return feedback;
      }
  }
};
