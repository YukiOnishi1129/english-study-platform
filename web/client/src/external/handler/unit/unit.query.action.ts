"use server";

import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { getUnitDetail } from "./unit.query.server";

export async function getUnitDetailAction(input: { unitId: string }) {
  try {
    const account = await getAuthenticatedAccount();
    return await getUnitDetail({
      unitId: input.unitId,
      accountId: account?.id,
    });
  } catch (_error) {
    return null;
  }
}
