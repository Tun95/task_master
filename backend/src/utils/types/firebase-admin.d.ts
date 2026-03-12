import 'firebase-admin/lib/auth';

declare module 'firebase-admin/lib/auth' {
  interface Auth {
    verifyPasswordResetCode(code: string): Promise<string>;
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  }
}
