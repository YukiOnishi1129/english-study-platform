"use server";

import { listMaterialsHierarchy } from "./material.query.server";

export async function listMaterialsHierarchyAction() {
  return listMaterialsHierarchy();
}
