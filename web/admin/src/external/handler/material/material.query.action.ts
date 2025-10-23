"use server";

import {
  getChapterDetail,
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

export async function getChapterDetailAction(input: { chapterId: string }) {
  try {
    return await getChapterDetail(input);
  } catch (_error) {
    return null;
  }
}
