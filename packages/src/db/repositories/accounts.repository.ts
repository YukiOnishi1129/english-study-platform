import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { accounts } from "../schema/accounts.js";

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export const accountsRepository = {
  async findById(id: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);

    return result[0];
  },

  async findByEmail(email: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);

    return result[0];
  },

  async findByProvider(provider: string, providerAccountId: string): Promise<Account | undefined> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.provider, provider) && eq(accounts.providerAccountId, providerAccountId))
      .limit(1);

    return result[0];
  },

  async create(account: NewAccount): Promise<Account> {
    const result = await db.insert(accounts).values(account).returning();

    return result[0]!;
  },

  async update(id: string, account: Partial<NewAccount>): Promise<Account | undefined> {
    const result = await db
      .update(accounts)
      .set({
        ...account,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return result[0];
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id)).returning();

    return result.length > 0;
  },
};
