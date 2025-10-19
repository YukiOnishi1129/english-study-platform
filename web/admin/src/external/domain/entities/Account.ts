export type Role = "admin" | "user";

export interface AccountParams {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  provider: string;
  providerAccountId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: Role;
  readonly provider: string;
  readonly providerAccountId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: AccountParams) {
    this.id = params.id || crypto.randomUUID();
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.role = params.role;
    this.provider = params.provider;
    this.providerAccountId = params.providerAccountId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  static create(
    params: Omit<AccountParams, "id" | "createdAt" | "updatedAt">,
  ): Account {
    return new Account(params);
  }
}
