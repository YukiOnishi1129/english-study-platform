import { accountsRepository } from "@acme/shared/db";
import { Account } from "@acme/shared/domain";
import type { AccountRepository } from "@/external/domain/repository-interfaces/AccountRepository";

export class AccountRepositoryImpl implements AccountRepository {
  async findById(id: string): Promise<Account | null> {
    const result = await accountsRepository.findById(id);
    
    if (!result) {
      return null;
    }
    
    return new Account({
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Account | null> {
    const result = await accountsRepository.findByEmail(email);
    
    if (!result) {
      return null;
    }
    
    return new Account({
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    const result = await accountsRepository.findByProvider(provider, providerAccountId);
    
    if (!result) {
      return null;
    }
    
    return new Account({
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async save(account: Account): Promise<Account> {
    const result = await accountsRepository.create({
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      thumbnail: account.thumbnail,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });

    return new Account({
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await accountsRepository.delete(id);
  }
}
