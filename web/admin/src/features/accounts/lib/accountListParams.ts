import {
  type ListAccountsRequest,
  ListAccountsRequestSchema,
} from "@/external/dto/account/account.query.dto";

type RawParamValue = string | string[] | undefined;
type RawSearchParams = Record<string, RawParamValue>;

const ROLE_VALUES = new Set<"admin" | "user">(["admin", "user"]);
const STATUS_VALUES = new Set<"active" | "inactive">(["active", "inactive"]);
const ORDER_VALUES = new Set([
  "lastLoginDesc",
  "lastLoginAsc",
  "createdDesc",
] as const);

export type AccountListOrder = "lastLoginDesc" | "lastLoginAsc" | "createdDesc";

function toArray(value: RawParamValue): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value;
  return [];
}

function parseNumber(value: RawParamValue): number | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseAccountListSearchParams(
  raw: RawSearchParams,
): ListAccountsRequest {
  const search =
    typeof raw.search === "string" && raw.search.trim().length > 0
      ? raw.search.trim()
      : undefined;

  const roles = toArray(raw.roles ?? raw.role).filter(
    (role): role is "admin" | "user" =>
      ROLE_VALUES.has(role as "admin" | "user"),
  );

  const statuses = toArray(raw.statuses ?? raw.status).filter(
    (status): status is "active" | "inactive" =>
      STATUS_VALUES.has(status as "active" | "inactive"),
  );

  const orderCandidate =
    typeof raw.orderBy === "string"
      ? raw.orderBy
      : typeof raw.order === "string"
        ? raw.order
        : undefined;

  const orderBy = ORDER_VALUES.has(orderCandidate as AccountListOrder)
    ? (orderCandidate as AccountListOrder)
    : undefined;

  const page = parseNumber(raw.page);
  const limit = parseNumber(raw.limit);

  const parsed = ListAccountsRequestSchema.parse({
    search,
    roles: roles.length > 0 ? roles : undefined,
    statuses: statuses.length > 0 ? statuses : undefined,
    orderBy,
    page,
    limit,
  });

  return {
    ...parsed,
    search:
      parsed.search && parsed.search.trim().length > 0
        ? parsed.search.trim()
        : undefined,
    roles:
      parsed.roles && parsed.roles.length > 0
        ? Array.from(parsed.roles)
        : undefined,
    statuses:
      parsed.statuses && parsed.statuses.length > 0
        ? Array.from(parsed.statuses)
        : undefined,
  };
}

export function serializeAccountListKey(params: ListAccountsRequest): string {
  const normalized = ListAccountsRequestSchema.parse(params);
  return JSON.stringify({
    search:
      normalized.search && normalized.search.trim().length > 0
        ? normalized.search.trim()
        : "",
    roles: (normalized.roles ?? []).slice().sort(),
    statuses: (normalized.statuses ?? []).slice().sort(),
    orderBy: normalized.orderBy ?? "lastLoginDesc",
    page: normalized.page ?? 0,
    limit: normalized.limit ?? 20,
  });
}

export function buildAccountListSearchParams(
  params: ListAccountsRequest,
): URLSearchParams {
  const normalized = ListAccountsRequestSchema.parse(params);
  const query = new URLSearchParams();

  const trimmedSearch =
    normalized.search && normalized.search.trim().length > 0
      ? normalized.search.trim()
      : "";
  if (trimmedSearch.length > 0) {
    query.set("search", trimmedSearch);
  }

  for (const role of normalized.roles ?? []) {
    query.append("roles", role);
  }

  for (const status of normalized.statuses ?? []) {
    query.append("statuses", status);
  }

  if (normalized.orderBy) {
    query.set("orderBy", normalized.orderBy);
  }

  if ((normalized.page ?? 0) > 0) {
    query.set("page", String(normalized.page));
  }

  if (normalized.limit && normalized.limit > 0 && normalized.limit !== 20) {
    query.set("limit", String(normalized.limit));
  }

  return query;
}

export function mergeAccountListParams(
  base: ListAccountsRequest,
  updates: Partial<ListAccountsRequest>,
): ListAccountsRequest {
  return ListAccountsRequestSchema.parse({
    ...base,
    ...updates,
  });
}
