"use server";

import {
  getQuestionDetail,
  listMaterialsHierarchy,
} from "./material.query.server";

export async function listMaterialsHierarchyAction() {
  return listMaterialsHierarchy();
}

export async function getQuestionDetailAction(input: { questionId: string }) {
  try {
    return await getQuestionDetail(input);
  } catch (_error) {
    return null;
  }
}
