export interface ChapterEditFormProps {
  defaultValues: {
    chapterId: string;
    materialId: string;
    parentChapterId: string | null;
    name: string;
    description: string | null;
  };
}
