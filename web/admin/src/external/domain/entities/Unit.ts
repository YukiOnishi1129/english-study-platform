export interface UnitParams {
  id?: string;
  chapterId: string;
  name: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Unit {
  readonly id: string;
  readonly chapterId: string;
  readonly name: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: UnitParams) {
    this.id = params.id || crypto.randomUUID();
    this.chapterId = params.chapterId;
    this.name = params.name;
    this.order = params.order;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(
    params: Omit<UnitParams, "id" | "createdAt" | "updatedAt">,
  ): Unit {
    return new Unit(params);
  }
}
