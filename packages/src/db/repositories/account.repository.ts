import { type AccountRepository, Account as DomainAccount } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { accounts } from "../schema/accounts";

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// DDD Repository implementation
export class AccountRepositoryImpl implements AccountRepository {
  async findById(id: string): Promise<DomainAccount | null> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainAccount({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      thumbnail: data.thumbnail ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<DomainAccount | null> {
    const result = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainAccount({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      thumbnail: data.thumbnail ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
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

    return new DomainAccount({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      thumbnail: data.thumbnail ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async save(account: DomainAccount): Promise<DomainAccount> {
    const [result] = await db
      .insert(accounts)
      .values({
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
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
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          thumbnail: account.thumbnail ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save account");
    }

    return new DomainAccount({
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail ?? undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }
}
