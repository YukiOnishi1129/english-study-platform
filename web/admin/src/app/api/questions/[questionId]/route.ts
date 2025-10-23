import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  DeleteQuestionRequestSchema,
  UpdateQuestionRequestSchema,
} from "@/external/dto/material/material.command.dto";
import {
  deleteQuestion,
  updateQuestion,
} from "@/external/handler/material/material.command.server";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import { authOptions } from "@/features/auth/lib/options";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      questionId: string;
    }>;
  },
) {
  const session = await getServerSession(authOptions);
  if (!session?.account || session.account.role !== "admin" || session.error) {
    return NextResponse.json(
      { message: "認証に失敗しました。" },
      { status: 401 },
    );
  }

  const { questionId } = await context.params;

  try {
    const body = await request.json();
    const payload = UpdateQuestionRequestSchema.parse({
      ...body,
      questionId,
    });

    const detail = await updateQuestion(payload);

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(detail.material.id));
    if (detail.chapterPath.length > 0) {
      const lastChapter = detail.chapterPath[detail.chapterPath.length - 1];
      revalidatePath(toChapterDetailPath(lastChapter.id));
    }
    revalidatePath(toUnitDetailPath(detail.unit.id));
    revalidatePath(toQuestionDetailPath(detail.question.id));

    return NextResponse.json({
      message: "問題を更新しました。",
      detail,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "問題の更新に失敗しました。",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      questionId: string;
    }>;
  },
) {
  const session = await getServerSession(authOptions);
  if (!session?.account || session.account.role !== "admin" || session.error) {
    return NextResponse.json(
      { message: "認証に失敗しました。" },
      { status: 401 },
    );
  }

  const { questionId } = await context.params;

  try {
    const detail = await getQuestionDetail({ questionId });

    const body = await request.json().catch(() => ({}));
    const payload = DeleteQuestionRequestSchema.parse({
      questionId,
      unitId: detail.unit.id,
      ...body,
    });

    await deleteQuestion(payload);

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(detail.material.id));
    if (detail.chapterPath.length > 0) {
      const lastChapter = detail.chapterPath[detail.chapterPath.length - 1];
      revalidatePath(toChapterDetailPath(lastChapter.id));
    }
    revalidatePath(toUnitDetailPath(detail.unit.id));

    return NextResponse.json({ message: "問題を削除しました。" });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "問題の削除に失敗しました。",
      },
      { status: 400 },
    );
  }
}
