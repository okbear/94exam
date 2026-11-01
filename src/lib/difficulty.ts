import difficultyData from "../data/difficulty-2026.json";
export const difficulties = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof difficulties)[number];
export const difficultyInfo = {
  beginner: {
    label: "初級",
    description: "基本用語・制度の確認と、単純な計算",
  },
  intermediate: {
    label: "中級",
    description: "条件の読み取り・制度の使い分けと、複数手順の計算",
  },
  advanced: {
    label: "上級",
    description: "例外・上限の判断と、複数の制度を組み合わせた総合演習",
  },
} as const;
// Editorial difficulty is independent of FSRS's per-learner memory difficulty.
export const difficultyGroups: Record<Difficulty, readonly string[]> =
  difficultyData;
export function getQuestionDifficulty(id: string): Difficulty {
  const difficulty = difficulties.find((difficulty) =>
    difficultyGroups[difficulty].includes(id),
  );
  if (!difficulty)
    throw new Error(`Question difficulty is not assigned: ${id}`);
  return difficulty;
}
