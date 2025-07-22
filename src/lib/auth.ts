// In a real application, you would use a database.
// For this example, we'll use an in-memory store.
interface User {
  id: number;
  username: string;
  pinHash: string;
  apiKeyEncrypted?: string;
}

const users: User[] = [];
let userIdCounter = 1;

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
      };
      users.push(newUser);
      return newUser;
    },
    update: async ({ where: { id }, data }: { where: { id: number }, data: { apiKeyEncrypted: string }}) => {
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            return users[userIndex];
        }
        return undefined;
    }
  }
};

    