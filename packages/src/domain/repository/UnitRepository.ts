import type { Unit } from "../entities/Unit";

export interface UnitRepository {
  findById(id: string): Promise<Unit | null>;
  findByChapterId(chapterId: string): Promise<Unit[]>;
  save(unit: Unit): Promise<Unit>;
  delete(id: string): Promise<void>;
  updateOrders(chapterId: string, updates: Array<{ id: string; order: number }>): Promise<void>;
}
