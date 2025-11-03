import { AccountRepositoryImpl } from "@acme/shared/db";
import { Account } from "@acme/shared/domain";

export interface CreateAccountInput {
  email: string;
  name: string;
  provider: string;
  providerAccountId: string;
  thumbnail?: string;
}

interface NormalizedProfile {
  firstName: string;
  lastName: string;
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

  private normalizeProfile(input: CreateAccountInput): NormalizedProfile {
    const fallbackName = input.email.split("@")[0] ?? input.email;
    const trimmedName = input.name.trim();
    const parts = trimmedName.split(/\s+/).filter((part) => part.length > 0);

    let firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    if (!firstName) {
      firstName = fallbackName;
    }

    return {
      firstName,
      lastName,
      thumbnail: input.thumbnail,
    };
  }

  async create(
    input: CreateAccountInput,
    normalizedProfile?: NormalizedProfile,
  ): Promise<Account> {
    const profile = normalizedProfile ?? this.normalizeProfile(input);
    const now = new Date();
    const newAccount = Account.create({
      email: input.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: "user", // Default role for regular users
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      thumbnail: profile.thumbnail,
      lastLoginAt: now,
    });

    return await this.accountRepository.save(newAccount);
  }

  async createOrGet(
    provider: string,
    providerAccountId: string,
    createInput: CreateAccountInput,
  ): Promise<Account> {
    const normalizedProfile = this.normalizeProfile(createInput);
    const now = new Date();

    const existingAccount = await this.findByProvider(
      provider,
      providerAccountId,
    );
    if (existingAccount) {
      const updatedAccount = existingAccount
        .withProfile({
          firstName: normalizedProfile.firstName,
          lastName: normalizedProfile.lastName,
          thumbnail: normalizedProfile.thumbnail,
        })
        .withLastLogin(now);

      return await this.accountRepository.save(updatedAccount);
    }

    return this.create(createInput, normalizedProfile);
  }
}
