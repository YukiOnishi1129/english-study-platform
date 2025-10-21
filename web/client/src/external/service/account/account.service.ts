import { AccountRepositoryImpl } from "@acme/shared/db";
import { Account } from "@acme/shared/domain";

export interface CreateAccountInput {
  email: string;
  name: string;
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
}

export class AccountService {
  private accountRepository: AccountRepositoryImpl;

  constructor() {
    this.accountRepository = new AccountRepositoryImpl();
  }

  async findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    return this.accountRepository.findByProvider(provider, providerAccountId);
  }

  async create(input: CreateAccountInput): Promise<Account> {
    // Split name into firstName and lastName
    const nameParts = input.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const newAccount = Account.create({
      email: input.email,
      firstName,
      lastName,
      role: "user", // Default role for regular users
      provider: input.provider,
      providerAccountId: input.providerAccountId,
    });

    return await this.accountRepository.save(newAccount);
  }

  async createOrGet(
    provider: string,
    providerAccountId: string,
    createInput: CreateAccountInput,
  ): Promise<Account> {
    const existingAccount = await this.findByProvider(
      provider,
      providerAccountId,
    );
    if (existingAccount) {
      return existingAccount;
    }

    return this.create(createInput);
  }
}
