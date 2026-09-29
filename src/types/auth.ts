export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    otp?: string;
    username?: string;
  };
  success?: boolean;
} | null;
