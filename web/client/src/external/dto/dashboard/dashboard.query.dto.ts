import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalAnswerCount: z.number().int().nonnegative(),
  correctAnswerCount: z.number().int().nonnegative(),
  todayAnswerCount: z.number().int().nonnegative(),
  accuracyRate: z.number().min(0).max(1),
  studyStreakCount: z.number().int().nonnegative(),
  totalQuestionCount: z.number().int().nonnegative(),
});

export type DashboardStatsDto = z.infer<typeof DashboardStatsSchema>;

export const DashboardStudyCalendarEntrySchema = z.object({
  date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u),
  totalAnswers: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
});

export type DashboardStudyCalendarEntryDto = z.infer<
  typeof DashboardStudyCalendarEntrySchema
>;

export const DashboardMaterialUnitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
});

export type DashboardMaterialUnitDto = z.infer<
  typeof DashboardMaterialUnitSchema
>;

export interface DashboardMaterialChapterDto {
  id: string;
  name: string;
  description: string | null;
  level: number;
  order: number;
  units: DashboardMaterialUnitDto[];
  children: DashboardMaterialChapterDto[];
}

export const DashboardMaterialChapterSchema: z.ZodType<DashboardMaterialChapterDto> =
  z.lazy(() =>
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable(),
      level: z.number().int().nonnegative(),
      order: z.number().int().nonnegative(),
      units: z.array(DashboardMaterialUnitSchema),
      children: z.array(DashboardMaterialChapterSchema),
    }),
  );

export interface DashboardMaterialSummaryDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  totalUnitCount: number;
  totalQuestionCount: number;
  progressRate: number;
  chapters: DashboardMaterialChapterDto[];
}

export const DashboardMaterialSummarySchema: z.ZodType<DashboardMaterialSummaryDto> =
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    order: z.number().int().nonnegative(),
    totalUnitCount: z.number().int().nonnegative(),
    totalQuestionCount: z.number().int().nonnegative(),
    progressRate: z.number().min(0).max(1),
    chapters: z.array(DashboardMaterialChapterSchema),
  });

export interface DashboardDataDto {
  stats: DashboardStatsDto;
  studyCalendar: DashboardStudyCalendarEntryDto[];
  materials: DashboardMaterialSummaryDto[];
}

export const DashboardDataSchema: z.ZodType<DashboardDataDto> = z.object({
  stats: DashboardStatsSchema,
  studyCalendar: z.array(DashboardStudyCalendarEntrySchema),
  materials: z.array(DashboardMaterialSummarySchema),
});
