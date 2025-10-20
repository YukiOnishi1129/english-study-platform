import { Account } from "@acme/shared/domain";
import { AccountRepositoryImpl } from "@/external/repository/account.repository";

export interface CreateAccountInput {
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  provider: string;
  providerAccountId: string;
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
    const newAccount = Account.create({
      email: createInput.email,
      firstName: createInput.firstName,
      lastName: createInput.lastName,
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
}
