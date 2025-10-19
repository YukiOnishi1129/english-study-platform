export class ChapterPath {
  private readonly path: string;
  private readonly segments: string[];

  constructor(path: string) {
    this.path = path;
    this.segments = path.split("/").filter((s) => s.length > 0);

    if (this.segments.length === 0) {
      throw new Error("Chapter path cannot be empty");
    }
  }

  getLevel(): number {
    return this.segments.length - 1;
  }

  getParentPath(): ChapterPath | null {
    if (this.segments.length === 1) {
      return null;
    }

    const parentSegments = this.segments.slice(0, -1);
    return new ChapterPath(parentSegments.join("/"));
  }

  toArray(): string[] {
    return [...this.segments];
  }

  toString(): string {
    return this.path;
  }

  equals(other: ChapterPath): boolean {
    return this.path === other.path;
  }

  getSegmentAt(index: number): string | undefined {
    return this.segments[index];
  }

  getLastSegment(): string {
    return this.segments[this.segments.length - 1];
  }
}
