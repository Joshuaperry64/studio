// In a real application, you would use a database.
// For this example, we'll use an in-memory store.
interface User {
  id: number;
  username: string;
  pinHash: string;
}

const users: User[] = [];
let userIdCounter = 1;

export const db = {
  users: {
    findUnique: async ({ where: { username } }: { where: { username: string } }) => {
      return users.find(user => user.username === username);
    },
    create: async ({ data }: { data: { username: string; pinHash: string } }) => {
      const newUser: User = {
        id: userIdCounter++,
        username: data.username,
        pinHash: data.pinHash,
      };
      users.push(newUser);
      return newUser;
    }
  }
};
