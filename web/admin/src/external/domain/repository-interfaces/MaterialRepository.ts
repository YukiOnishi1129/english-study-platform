import type { Material } from "../entities/Material";

export interface MaterialRepository {
  findById(id: string): Promise<Material | null>;
  findAll(): Promise<Material[]>;
  save(material: Material): Promise<Material>;
  delete(id: string): Promise<void>;
}
