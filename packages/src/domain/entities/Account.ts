export type Role = "admin" | "user";

export interface AccountParams {
  id?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly lastLoginAt: Date | null;
  readonly provider: string;
  readonly providerAccountId: string;
  readonly thumbnail?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: AccountParams) {
    this.id = params.id || crypto.randomUUID();
    this.email = params.email;
    this.firstName = params.firstName ?? "";
    this.lastName = params.lastName ?? "";
    this.role = params.role;
    this.isActive = params.isActive ?? true;
    this.lastLoginAt = params.lastLoginAt ?? null;
    this.provider = params.provider;
    this.providerAccountId = params.providerAccountId;
    this.thumbnail = params.thumbnail;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  get fullName(): string {
    const parts = [this.firstName, this.lastName].filter(
      (value) => value && value.trim().length > 0,
    );
    return parts.join(" ").trim();
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  static create(params: Omit<AccountParams, "id" | "createdAt" | "updatedAt">): Account {
    return new Account(params);
  }

  isInactive(): boolean {
    return !this.isActive;
  }

  withLastLogin(date: Date): Account {
    return new Account({
      ...this,
      lastLoginAt: date,
      updatedAt: new Date(),
    });
  }

  deactivate(): Account {
    return new Account({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  activate(): Account {
    return new Account({
      ...this,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  withRole(role: Role): Account {
    return new Account({
      ...this,
      role,
      updatedAt: new Date(),
    });
  }

  withStatus(isActive: boolean): Account {
    return new Account({
      ...this,
      isActive,
      updatedAt: new Date(),
    });
  }

  withProfile(profile: {
    firstName?: string;
    lastName?: string;
    thumbnail?: string | null;
  }): Account {
    return new Account({
      ...this,
      firstName: profile.firstName ?? this.firstName,
      lastName: profile.lastName ?? this.lastName,
      thumbnail:
        profile.thumbnail !== undefined ? profile.thumbnail ?? undefined : this.thumbnail,
      updatedAt: new Date(),
    });
  }
}
