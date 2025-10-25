"use server";

import {
  getChapterDetail,
  getMaterialHierarchyById,
  getQuestionDetail,
  getUnitDetail,
  listMaterialsHierarchy,
} from "./material.query.server";

export async function listMaterialsHierarchyAction() {
  return listMaterialsHierarchy();
}

export async function getMaterialHierarchyAction(input: {
  materialId: string;
}) {
  try {
    return await getMaterialHierarchyById(input);
  } catch (_error) {
    return null;
  }
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

export async function getUnitDetailAction(input: { unitId: string }) {
  try {
    return await getUnitDetail(input);
  } catch (_error) {
    return null;
  }
}
