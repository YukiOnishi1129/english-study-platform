import type { Account, Role } from "../entities/Account";
import type { AccountRoleHistory } from "../entities/AccountRoleHistory";
import type { AccountStatus, AccountStatusHistory } from "../entities/AccountStatusHistory";

export interface AccountListQuery {
  search?: string;
  roles?: Role[];
  statuses?: AccountStatus[];
  orderBy?: "lastLoginDesc" | "lastLoginAsc" | "createdDesc";
  limit?: number;
  offset?: number;
}

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  findByProvider(provider: string, providerAccountId: string): Promise<Account | null>;
  findMany(params: AccountListQuery): Promise<Account[]>;
  count(params: AccountListQuery): Promise<number>;
  save(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
  createRoleHistory(history: AccountRoleHistory): Promise<AccountRoleHistory>;
  createStatusHistory(history: AccountStatusHistory): Promise<AccountStatusHistory>;
}
