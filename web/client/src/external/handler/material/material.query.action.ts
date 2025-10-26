"use server";

import { getMaterialDetail, getMaterialList } from "./material.query.server";

export async function getMaterialListAction(accountId?: string | null) {
  try {
    return await getMaterialList({ accountId: accountId ?? null });
  } catch (error) {
    console.error("Failed to fetch material list", error);
    return [];
  }
}

export async function getMaterialDetailAction(input: {
  materialId: string;
  accountId?: string | null;
}) {
  try {
    return await getMaterialDetail({
      materialId: input.materialId,
      accountId: input.accountId ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch material detail", error);
    return null;
  }
}
