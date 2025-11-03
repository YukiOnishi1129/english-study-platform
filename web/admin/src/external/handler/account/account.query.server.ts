import "server-only";
import {
  type AccountResponse,
  type GetAccountByEmailRequest,
  GetAccountByEmailRequestSchema,
  type GetAccountByProviderRequest,
  GetAccountByProviderRequestSchema,
  type ListAccountsRequest,
  ListAccountsRequestSchema,
  type ListAccountsResponse,
  ListAccountsResponseSchema,
  toAccountResponse,
} from "@/external/dto/account/account.query.dto";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function getAccountByProvider(
  request: GetAccountByProviderRequest,
): Promise<AccountResponse | null> {
  // 入力バリデーション
  const validated = GetAccountByProviderRequestSchema.parse(request);

  const account = await accountService.findAccountByProvider(
    validated.provider,
    validated.providerAccountId,
  );

  return account ? toAccountResponse(account) : null;
}

export async function getAccountByEmail(
  request: GetAccountByEmailRequest,
): Promise<AccountResponse | null> {
  const validated = GetAccountByEmailRequestSchema.parse(request);

  const account = await accountService.findAccountByEmail(validated.email);

  return account ? toAccountResponse(account) : null;
}

export async function listAccounts(
  request: ListAccountsRequest,
): Promise<ListAccountsResponse> {
  const validated = ListAccountsRequestSchema.parse(request);

  const result = await accountService.listAccounts({
    search:
      validated.search && validated.search.trim().length > 0
        ? validated.search.trim()
        : undefined,
    roles: validated.roles,
    statuses: validated.statuses,
    orderBy: validated.orderBy,
    page: validated.page,
    limit: validated.limit,
  });

  return ListAccountsResponseSchema.parse({
    total: result.total,
    page: result.page,
    limit: result.limit,
    items: result.items.map(toAccountResponse),
  });
}

export async function getAccountDetail(accountId: string) {
  const account = await accountService.findAccountById(accountId);
  return account ? toAccountResponse(account) : null;
}
