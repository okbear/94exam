import editionData from "../data/edition-2026.json";
import recallQuestionsData from "../data/questions-recall-2026.json";
import standardQuestionsData from "../data/questions-standard-2026.json";
import caseQuestionsData from "../data/questions-cases-2026.json";
import examQuestionsData from "../data/questions-exam-2026.json";
import {
  difficulties,
  difficultyInfo,
  getQuestionDifficulty,
  type Difficulty,
} from "./difficulty";
export { difficulties, difficultyInfo, type Difficulty };
export const categories = [
  "給与の基礎",
  "労働時間・割増賃金",
  "社会保険",
  "税金・控除",
  "賞与計算",
  "労働法令",
] as const;
export type Category = (typeof categories)[number];
export type QuestionKind = "knowledge" | "calculation";
export type ReferenceMaterial = {
  title: string;
  columns: string[];
  rows: string[][];
  note: string;
  source?: string;
};
type QuestionBase = {
  difficulty: Difficulty;
  id: string;
  category: Category;
  title: string;
  prompt: string;
  explanation: string;
  materials?: { label: string; value: string }[];
  referenceMaterials?: ReferenceMaterial[];
  source?: string;
};
export type KnowledgeQuestion = QuestionBase & {
  kind: "knowledge";
  knowledgeRequired?: false;
  choices: string[];
  answer: number;
  formula?: undefined;
  unit?: undefined;
};
export type CalculationQuestion = QuestionBase & {
  kind: "calculation";
  knowledgeRequired?: boolean;
  answer: number;
  unit: string;
  formula: string;
  choices?: undefined;
};
export type Question = KnowledgeQuestion | CalculationQuestion;

export function parseNumericAnswer(raw: string): number | null {
  const normalized = raw
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[，、,]/g, "")
    .replace(/．/g, ".")
    .replace(/[−ー－]/g, "-")
    .replace(/円/g, "")
    .trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function formatCalculationAnswer(
  question: Pick<CalculationQuestion, "answer" | "unit">,
): string {
  return `${question.answer.toLocaleString("ja-JP")}${question.unit}`;
}

export function parseQuestion(raw: unknown): Question {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw))
    throw new Error("問題データの形式が正しくありません");
  const entry = raw as Record<string, unknown>;
  const { id, category, title, prompt, explanation, kind } = entry;
  if (
    typeof id !== "string" ||
    !id ||
    typeof category !== "string" ||
    !categories.includes(category as Category) ||
    typeof title !== "string" ||
    !title ||
    typeof prompt !== "string" ||
    !prompt ||
    typeof explanation !== "string" ||
    !explanation
  ) {
    throw new Error(`問題データの必須項目が不足しています: ${String(id)}`);
  }
  if (
    entry.difficulty !== undefined &&
    (typeof entry.difficulty !== "string" ||
      !difficulties.includes(entry.difficulty as Difficulty))
  ) {
    throw new Error(`難易度の指定が正しくありません: ${id}`);
  }
  const difficulty =
    (entry.difficulty as Difficulty | undefined) ?? getQuestionDifficulty(id);
  if (
    entry.source !== undefined &&
    (typeof entry.source !== "string" || !entry.source.startsWith("https://"))
  ) {
    throw new Error(`出典URLの形式が正しくありません: ${id}`);
  }
  const source = entry.source;
  let referenceMaterials: ReferenceMaterial[] | undefined;
  if (entry.referenceMaterials !== undefined) {
    if (!Array.isArray(entry.referenceMaterials) || !entry.referenceMaterials.length)
      throw new Error(`別資料の形式が正しくありません: ${id}`);
    referenceMaterials = entry.referenceMaterials.map((raw) => {
      const m = raw as ReferenceMaterial | null;
      if (!m || typeof m !== "object" || Array.isArray(m) ||
        typeof m.title !== "string" || !m.title.trim() ||
        typeof m.note !== "string" || !m.note.trim() ||
        !Array.isArray(m.columns) || !m.columns.length ||
        !m.columns.every((c) => typeof c === "string" && c.trim()) ||
        !Array.isArray(m.rows) || !m.rows.length ||
        !m.rows.every((row) => Array.isArray(row) && row.length === m.columns.length &&
          row.every((cell) => typeof cell === "string" && cell.trim())) ||
        (m.source !== undefined && (typeof m.source !== "string" || !m.source.startsWith("https://"))))
        throw new Error(`別資料の形式が正しくありません: ${id}`);
      return { title: m.title, columns: [...m.columns], rows: m.rows.map((row) => [...row]),
        note: m.note, ...(m.source ? { source: m.source } : {}) };
    });
  }
  if (entry.materials !== undefined && !Array.isArray(entry.materials)) {
    throw new Error(`資料データの形式が正しくありません: ${id}`);
  }
  const materials = Array.isArray(entry.materials)
    ? entry.materials.map((item) => {
        if (
          typeof item !== "object" ||
          item === null ||
          Array.isArray(item) ||
          typeof (item as Record<string, unknown>).label !== "string" ||
          typeof (item as Record<string, unknown>).value !== "string"
        ) {
          throw new Error(`資料データの形式が正しくありません: ${id}`);
        }
        const material = item as { label: string; value: string };
        return { label: material.label, value: material.value };
      })
    : undefined;
  const base: QuestionBase = {
    id,
    category: category as Category,
    difficulty,
    title,
    prompt,
    explanation,
    ...(materials ? { materials } : {}),
    ...(referenceMaterials ? { referenceMaterials } : {}),
    ...(source ? { source } : {}),
  };
  if (kind === "knowledge") {
    if (
      !Array.isArray(entry.choices) ||
      entry.choices.length !== 4 ||
      !entry.choices.every(
        (c): c is string => typeof c === "string" && c.trim().length > 0,
      ) ||
      new Set(entry.choices).size !== 4 ||
      typeof entry.answer !== "number" ||
      !Number.isInteger(entry.answer) ||
      entry.answer < 0 ||
      entry.answer >= entry.choices.length
    ) {
      throw new Error(`知識問題のデータが正しくありません: ${id}`);
    }
    return {
      ...base,
      kind: "knowledge",
      choices: entry.choices,
      answer: entry.answer,
    };
  }
  if (
    kind === "calculation" &&
    typeof entry.answer === "number" &&
    Number.isFinite(entry.answer) &&
    typeof entry.formula === "string" &&
    entry.formula
  ) {
    return {
      ...base,
      kind: "calculation",
      answer: entry.answer,
      unit: typeof entry.unit === "string" && entry.unit ? entry.unit : "円",
      formula: entry.formula,
      ...(entry.knowledgeRequired === true ? { knowledgeRequired: true } : {}),
    };
  }
  throw new Error(`問題種別または解答データが正しくありません: ${id}`);
}

export function parseQuestionBank(raw: unknown): Question[] {
  if (!Array.isArray(raw))
    throw new Error("問題一覧データの形式が正しくありません");
  const parsed = raw.map(parseQuestion);
  const seen = new Set<string>();
  for (const question of parsed) {
    if (seen.has(question.id))
      throw new Error(`重複する問題IDがあります: ${question.id}`);
    seen.add(question.id);
  }
  return parsed;
}

export const edition = editionData;
export const standardQuestions: Question[] = parseQuestionBank(
  standardQuestionsData,
);
export const recallQuestions: Question[] =
  parseQuestionBank(recallQuestionsData);
export const caseQuestions: Question[] = parseQuestionBank(caseQuestionsData);
export const examQuestions: Question[] = parseQuestionBank(examQuestionsData);
export const questions: Question[] = parseQuestionBank([
  ...standardQuestions, ...recallQuestions, ...caseQuestions, ...examQuestions,
]);
