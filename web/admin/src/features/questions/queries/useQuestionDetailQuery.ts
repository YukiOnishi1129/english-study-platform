"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuestionDetailAction } from "@/external/handler/material/material.query.action";
import { questionKeys } from "./keys";

export function useQuestionDetailQuery(questionId: string) {
  return useQuery({
    queryKey: questionKeys.detail(questionId),
    queryFn: async () => {
      const response = await getQuestionDetailAction({ questionId });
      if (!response) {
        throw new Error("QUESTION_NOT_FOUND");
      }
      return response;
    },
  });
}
