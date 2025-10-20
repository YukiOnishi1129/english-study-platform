import type { Account } from "../entities/Account";

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  findByProvider(provider: string, providerAccountId: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}
