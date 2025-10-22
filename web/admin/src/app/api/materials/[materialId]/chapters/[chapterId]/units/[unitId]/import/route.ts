import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  type ImportUnitQuestionsRequest,
  ImportUnitQuestionsRequestSchema,
} from "@/external/dto/material/material.command.dto";
import { importUnitQuestions } from "@/external/handler/material/material.command.server";
import { authOptions } from "@/features/auth/lib/options";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      materialId: string;
      chapterId: string;
      unitId: string;
    }>;
  },
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.account || session.account.role !== "admin" || session.error) {
    return NextResponse.json(
      { message: "認証に失敗しました。" },
      { status: 401 },
    );
  }

  let payload: ImportUnitQuestionsRequest;
  try {
    const body = await request.json();
    const parsed = ImportUnitQuestionsRequestSchema.safeParse({
      ...body,
      unitId: params.unitId,
    });
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。";
      return NextResponse.json({ message }, { status: 400 });
    }
    payload = parsed.data;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "リクエストの解析に失敗しました。",
      },
      { status: 400 },
    );
  }

  try {
    const result = await importUnitQuestions(payload);

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(params.materialId));
    revalidatePath(toChapterDetailPath(params.chapterId));
    revalidatePath(toUnitDetailPath(params.unitId));

    return NextResponse.json({
      message: "CSVの内容を取り込みました。",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "UNITの取り込みに失敗しました。",
      },
      { status: 400 },
    );
  }
}
