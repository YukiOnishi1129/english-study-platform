import {
  type AccountListQuery,
  type AccountRepository,
  Account as DomainAccount,
  AccountRoleHistory as DomainAccountRoleHistory,
  AccountStatusHistory as DomainAccountStatusHistory,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../client";
import { accountRoleHistories } from "../schema/account-role-histories";
import { accountStatusHistories } from "../schema/account-status-histories";
import { accounts } from "../schema/accounts";

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

function mapToDomainAccount(data: Account): DomainAccount {
  return new DomainAccount({
    id: data.id,
    email: data.email,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
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

  async findMany(params: AccountListQuery): Promise<DomainAccount[]> {
    const { search, roles, statuses, orderBy, limit = 50, offset = 0 } = params;
    const filters = buildFilters({ search, roles, statuses });

    const orderings = buildOrderBy(orderBy);

    const query = db.select().from(accounts);
    if (filters.length > 0) {
      query.where(and(...filters));
    }
    query
      .orderBy(...orderings)
      .limit(limit)
      .offset(offset);

    const rows = await query;
    return rows.map(mapToDomainAccount);
  }

  async count(params: AccountListQuery): Promise<number> {
    const { search, roles, statuses } = params;
    const filters = buildFilters({ search, roles, statuses });
    const query = db.select({ count: sql<number>`count(*)` }).from(accounts);
    if (filters.length > 0) {
      query.where(and(...filters));
    }
    const [row] = await query;
    return Number(row?.count ?? 0);
  }

  async save(account: DomainAccount): Promise<DomainAccount> {
    const [result] = await db
      .insert(accounts)
      .values({
        id: account.id,
        email: account.email,
        firstName: toNullableName(account.firstName),
        lastName: toNullableName(account.lastName),
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
          firstName: toNullableName(account.firstName),
          lastName: toNullableName(account.lastName),
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

  async createRoleHistory(history: DomainAccountRoleHistory): Promise<DomainAccountRoleHistory> {
    const [row] = await db
      .insert(accountRoleHistories)
      .values({
        id: history.id,
        accountId: history.accountId,
        previousRole: history.previousRole,
        nextRole: history.nextRole,
        changedByAccountId: history.changedByAccountId,
        changedAt: history.changedAt,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create account role history");
    }

    return new DomainAccountRoleHistory({
      id: row.id,
      accountId: row.accountId,
      previousRole: row.previousRole,
      nextRole: row.nextRole,
      changedByAccountId: row.changedByAccountId,
      changedAt: row.changedAt,
    });
  }

  async createStatusHistory(
    history: DomainAccountStatusHistory,
  ): Promise<DomainAccountStatusHistory> {
    const [row] = await db
      .insert(accountStatusHistories)
      .values({
        id: history.id,
        accountId: history.accountId,
        previousStatus: history.previousStatus,
        nextStatus: history.nextStatus,
        changedByAccountId: history.changedByAccountId,
        changedAt: history.changedAt,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create account status history");
    }

    return new DomainAccountStatusHistory({
      id: row.id,
      accountId: row.accountId,
      previousStatus: row.previousStatus,
      nextStatus: row.nextStatus,
      changedByAccountId: row.changedByAccountId,
      changedAt: row.changedAt,
    });
  }
}

function toNullableName(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildFilters({
  search,
  roles,
  statuses,
}: Pick<AccountListQuery, "search" | "roles" | "statuses">) {
  const filters = [];

  if (search && search.trim().length > 0) {
    const pattern = `%${search.trim().replace(/[%_]/g, "\\$&")}%`;
    filters.push(
      or(
        ilike(accounts.email, pattern),
        ilike(accounts.firstName, pattern),
        ilike(accounts.lastName, pattern),
      ),
    );
  }

  if (roles && roles.length > 0) {
    filters.push(inArray(accounts.role, roles));
  }

  if (statuses && statuses.length > 0 && statuses.length !== 2) {
    const target = statuses[0] === "active";
    filters.push(eq(accounts.isActive, target));
  }

  return filters;
}

function buildOrderBy(orderBy: AccountListQuery["orderBy"]) {
  switch (orderBy) {
    case "lastLoginAsc":
      return [sql`"accounts"."last_login_at" ASC NULLS FIRST`, asc(accounts.createdAt)];
    case "lastLoginDesc":
      return [sql`"accounts"."last_login_at" DESC NULLS LAST`, desc(accounts.createdAt)];
    default:
      return [desc(accounts.createdAt)];
  }
}
