import { AccountRepositoryImpl } from "@acme/shared/db";
import {
  Account,
  type AccountListQuery,
  AccountRoleHistory,
  AccountStatusHistory,
} from "@acme/shared/domain";

export interface CreateAccountInput {
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "user";
  provider: string;
  providerAccountId: string;
}

export interface ListAccountsInput extends AccountListQuery {
  page?: number;
  limit?: number;
}

export interface UpdateAccountRoleInput {
  targetAccountId: string;
  nextRole: "admin" | "user";
  operatorAccountId: string;
}

export interface UpdateAccountStatusInput {
  targetAccountId: string;
  isActive: boolean;
  operatorAccountId: string;
}

export class AccountService {
  private accountRepository: AccountRepositoryImpl;

  constructor() {
    this.accountRepository = new AccountRepositoryImpl();
  }

  async findOrCreateAccount(
    provider: string,
    providerAccountId: string,
    createInput: CreateAccountInput,
  ): Promise<Account> {
    // 既存アカウントを検索
    const existingAccount = await this.accountRepository.findByProvider(
      provider,
      providerAccountId,
    );

    if (existingAccount) {
      return existingAccount;
    }

    // 新規アカウントを作成
    const fallbackName = createInput.email.split("@")[0] ?? createInput.email;

    const newAccount = Account.create({
      email: createInput.email,
      firstName: createInput.firstName ?? fallbackName,
      lastName: createInput.lastName ?? "",
      role: createInput.role,
      provider: createInput.provider,
      providerAccountId: createInput.providerAccountId,
    });

    return await this.accountRepository.save(newAccount);
  }

  async findAccountByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    return await this.accountRepository.findByProvider(
      provider,
      providerAccountId,
    );
  }

  async findAccountByEmail(email: string): Promise<Account | null> {
    return await this.accountRepository.findByEmail(email);
  }

  async listAccounts(params: ListAccountsInput) {
    const { page = 0, limit = 20, ...query } = params;
    const offset = page * limit;

    const [items, total] = await Promise.all([
      this.accountRepository.findMany({ ...query, limit, offset }),
      this.accountRepository.count(query),
    ]);

    return { items, total, page, limit };
  }

  async findAccountById(id: string): Promise<Account | null> {
    return await this.accountRepository.findById(id);
  }

  async updateAccountRole(input: UpdateAccountRoleInput): Promise<Account> {
    if (input.targetAccountId === input.operatorAccountId) {
      throw new Error("自分自身のロールは変更できません。");
    }

    const account = await this.accountRepository.findById(
      input.targetAccountId,
    );
    if (!account) {
      throw new Error("対象のアカウントが見つかりません。");
    }

    if (account.role === input.nextRole) {
      return account;
    }

    const updatedAccount = await this.accountRepository.save(
      account.withRole(input.nextRole),
    );

    await this.accountRepository.createRoleHistory(
      new AccountRoleHistory({
        accountId: account.id,
        previousRole: account.role,
        nextRole: input.nextRole,
        changedByAccountId: input.operatorAccountId,
      }),
    );

    return updatedAccount;
  }

  async updateAccountStatus(input: UpdateAccountStatusInput): Promise<Account> {
    if (input.targetAccountId === input.operatorAccountId) {
      throw new Error("自分自身の利用可否は変更できません。");
    }

    const account = await this.accountRepository.findById(
      input.targetAccountId,
    );
    if (!account) {
      throw new Error("対象のアカウントが見つかりません。");
    }

    if (account.isActive === input.isActive) {
      return account;
    }

    const updatedAccount = await this.accountRepository.save(
      input.isActive ? account.activate() : account.deactivate(),
    );

    await this.accountRepository.createStatusHistory(
      new AccountStatusHistory({
        accountId: account.id,
        previousStatus: account.isActive ? "active" : "inactive",
        nextStatus: input.isActive ? "active" : "inactive",
        changedByAccountId: input.operatorAccountId,
      }),
    );

    return updatedAccount;
  }
}
