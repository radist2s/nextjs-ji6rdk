export type User = Record<"email" | "password" | "name", string>;

const users = new Map<string, User>();

export const createUser = async ({ email, ...userRest }: User) => {
  const existingUser = users.get(email);

  if (existingUser) {
    return { error: "User already exists" };
  }

  const user = { email, ...userRest };
  users.set(email, user);

  return {
    user,
  };
};

export const readUser = async (email: string) => {
  return users.get(email);
};
