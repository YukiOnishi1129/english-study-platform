"use server";

import { getMaterialDetail, getMaterialList } from "./material.query.server";

export async function getMaterialListAction() {
  try {
    return await getMaterialList();
  } catch (error) {
    console.error("Failed to fetch material list", error);
    return [];
  }
}

export async function getMaterialDetailAction(input: { materialId: string }) {
  try {
    return await getMaterialDetail(input);
  } catch (error) {
    console.error("Failed to fetch material detail", error);
    return null;
  }
}
