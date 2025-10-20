export type TokenPayloadOutput = {
  userId: string;
  email?: string | null;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  isValid: boolean;
};
