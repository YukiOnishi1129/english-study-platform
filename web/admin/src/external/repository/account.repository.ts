import { and, eq } from "drizzle-orm";
import { db } from "@/external/client/db/client";
import { accounts } from "@/external/client/db/schema";
import { Account } from "@/external/domain/entities/Account";
import type { AccountRepository } from "@/external/domain/repository-interfaces/AccountRepository";

export class AccountRepositoryImpl implements AccountRepository {
  async findById(id: string): Promise<Account | null> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return new Account({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role as "admin" | "user",
      provider: row.provider,
      providerAccountId: row.providerAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return new Account({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role as "admin" | "user",
      provider: row.provider,
      providerAccountId: row.providerAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, providerAccountId),
        ),
      );

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return new Account({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role as "admin" | "user",
      provider: row.provider,
      providerAccountId: row.providerAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(account: Account): Promise<Account> {
    const result = await db
      .insert(accounts)
      .values({
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
      .returning();

    const savedRow = result[0];
    return new Account({
      id: savedRow.id,
      email: savedRow.email,
      firstName: savedRow.firstName,
      lastName: savedRow.lastName,
      role: savedRow.role as "admin" | "user",
      provider: savedRow.provider,
      providerAccountId: savedRow.providerAccountId,
      createdAt: savedRow.createdAt,
      updatedAt: savedRow.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }
}
