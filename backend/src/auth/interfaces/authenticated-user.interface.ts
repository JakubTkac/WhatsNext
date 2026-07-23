export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}
