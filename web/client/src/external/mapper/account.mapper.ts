import type { Account as DomainAccount } from "@acme/shared/domain";
import type { Account as FeatureAccount } from "@/features/account/types/account";

export function mapAccountToFeature(domainAccount: DomainAccount): FeatureAccount {
  return {
    id: domainAccount.id,
    email: domainAccount.email,
    firstName: domainAccount.firstName,
    lastName: domainAccount.lastName,
    fullName: domainAccount.fullName,
    role: domainAccount.role,
    provider: domainAccount.provider,
    providerAccountId: domainAccount.providerAccountId,
    thumbnail: domainAccount.thumbnail,
    isAdmin: domainAccount.isAdmin(),
    canAccessAdminPanel: domainAccount.canAccessAdminPanel(),
    createdAt: domainAccount.createdAt,
    updatedAt: domainAccount.updatedAt,
  };
}
