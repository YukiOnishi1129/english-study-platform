export interface MaterialParams {
  id?: string;
  name: string;
  description: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Material {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: MaterialParams) {
    this.id = params.id || crypto.randomUUID();
    this.name = params.name;
    this.description = params.description;
    this.order = params.order;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(
    params: Omit<MaterialParams, "id" | "createdAt" | "updatedAt">,
  ): Material {
    return new Material(params);
  }
}
