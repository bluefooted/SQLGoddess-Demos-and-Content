import type { AuthUser, IAuthService } from './IAuthService';

const PREVIEW_USER: AuthUser = {
  id: 'local-preview-user',
  email: 'demo@pawfectmatch.org',
  name: 'Pawfect Match Demo',
};

export class PreviewAuthService implements IAuthService {
  readonly fabricAuthEnabled = false;
  private user: AuthUser | null = null;

  async signIn(): Promise<AuthUser> {
    this.user = PREVIEW_USER;
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.user;
  }

  async initEmbeddedAuth(): Promise<AuthUser | null> {
    return null;
  }
}