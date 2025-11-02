import { type AccountRepository, Account as DomainAccount } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { accounts } from "../schema/accounts";

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

function mapToDomainAccount(data: Account): DomainAccount {
  return new DomainAccount({
    id: data.id,
    email: data.email,
    firstName: data.firstName ?? undefined,
    lastName: data.lastName ?? undefined,
    role: data.role,
    isActive: data.isActive,
    lastLoginAt: data.lastLoginAt ?? null,
    provider: data.provider,
    providerAccountId: data.providerAccountId,
    thumbnail: data.thumbnail ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
}

// DDD Repository implementation
export class AccountRepositoryImpl implements AccountRepository {
  async findById(id: string): Promise<DomainAccount | null> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return mapToDomainAccount(data);
  }

  async findByEmail(email: string): Promise<DomainAccount | null> {
    const result = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return mapToDomainAccount(data);
  }

  async findByProvider(provider: string, providerAccountId: string): Promise<DomainAccount | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)),
      )
      .limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return mapToDomainAccount(data);
  }

  async save(account: DomainAccount): Promise<DomainAccount> {
    const [result] = await db
      .insert(accounts)
      .values({
        id: account.id,
        email: account.email,
        firstName: account.firstName ?? null,
        lastName: account.lastName ?? null,
        role: account.role,
        isActive: account.isActive,
        lastLoginAt: account.lastLoginAt,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        thumbnail: account.thumbnail ?? null,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          email: account.email,
          firstName: account.firstName ?? null,
          lastName: account.lastName ?? null,
          role: account.role,
          isActive: account.isActive,
          lastLoginAt: account.lastLoginAt,
          thumbnail: account.thumbnail ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save account");
    }

    return mapToDomainAccount(result);
  }

  async delete(id: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }
}
