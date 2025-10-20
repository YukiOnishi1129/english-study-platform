import { Material as DomainMaterial, type MaterialRepository } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { materials } from "../schema/materials";

export type Material = InferSelectModel<typeof materials>;
export type NewMaterial = InferInsertModel<typeof materials>;

// DDD Repository implementation
export class MaterialRepositoryImpl implements MaterialRepository {
  async findById(id: string): Promise<DomainMaterial | null> {
    const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainMaterial({
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(): Promise<DomainMaterial[]> {
    const results = await db.select().from(materials).orderBy(materials.order);

    return results.map(
      (data) =>
        new DomainMaterial({
          id: data.id,
          name: data.name,
          description: data.description ?? undefined,
          order: data.order,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async save(material: DomainMaterial): Promise<DomainMaterial> {
    const [result] = await db
      .insert(materials)
      .values({
        id: material.id,
        name: material.name,
        description: material.description ?? null,
        order: material.order,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      })
      .onConflictDoUpdate({
        target: materials.id,
        set: {
          name: material.name,
          description: material.description ?? null,
          order: material.order,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save material");
    }

    return new DomainMaterial({
      id: result.id,
      name: result.name,
      description: result.description ?? undefined,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }
}
