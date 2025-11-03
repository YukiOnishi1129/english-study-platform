import type { Role } from "./Account";

export interface AccountRoleHistoryParams {
  id?: string;
  accountId: string;
  previousRole: Role;
  nextRole: Role;
  changedByAccountId: string;
  changedAt?: Date;
}

export class AccountRoleHistory {
  readonly id: string;
  readonly accountId: string;
  readonly previousRole: Role;
  readonly nextRole: Role;
  readonly changedByAccountId: string;
  readonly changedAt: Date;

  constructor(params: AccountRoleHistoryParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.accountId = params.accountId;
    this.previousRole = params.previousRole;
    this.nextRole = params.nextRole;
    this.changedByAccountId = params.changedByAccountId;
    this.changedAt = params.changedAt ?? new Date();
  }
}
