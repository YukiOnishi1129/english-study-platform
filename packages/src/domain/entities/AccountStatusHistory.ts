export type AccountStatus = "active" | "inactive";

export interface AccountStatusHistoryParams {
  id?: string;
  accountId: string;
  previousStatus: AccountStatus;
  nextStatus: AccountStatus;
  changedByAccountId: string;
  changedAt?: Date;
}

export class AccountStatusHistory {
  readonly id: string;
  readonly accountId: string;
  readonly previousStatus: AccountStatus;
  readonly nextStatus: AccountStatus;
  readonly changedByAccountId: string;
  readonly changedAt: Date;

  constructor(params: AccountStatusHistoryParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.accountId = params.accountId;
    this.previousStatus = params.previousStatus;
    this.nextStatus = params.nextStatus;
    this.changedByAccountId = params.changedByAccountId;
    this.changedAt = params.changedAt ?? new Date();
  }
}
