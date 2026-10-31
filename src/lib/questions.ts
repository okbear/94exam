import { additionalQuestions } from "./questions-2026";
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
export type Question = {
  kind: QuestionKind;
  level: 2;
  id: string;
  category: Category;
  title: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  materials?: { label: string; value: string }[];
  formula?: string;
  source?: string;
};
const labor =
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudouseisaku/chushoukigyou/joken_kankyou_rule.html";
const pension =
  "https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20121017.html";
const initialQuestions: Omit<Question, "kind" | "level">[] = [
  {
    id: "base-1",
    category: categories[0],
    title: "給与明細の基本",
    prompt:
      "基本給250,000円、役職手当20,000円、通勤手当10,000円。控除合計が55,000円のとき、差引支給額はいくらですか。",
    choices: ["225,000円", "235,000円", "245,000円", "280,000円"],
    answer: 0,
    explanation:
      "支給項目をすべて足した総支給額から、控除合計を差し引きます。非課税扱いの手当も、実際に支払う支給額には含めます。",
    formula: "280,000 − 55,000 = 225,000円",
  },
  {
    id: "base-2",
    category: categories[0],
    title: "賃金支払いの原則",
    prompt: "賃金支払いの5原則に含まれないものはどれですか。",
    choices: ["通貨払い", "直接払い", "全額払い", "毎週払い"],
    answer: 3,
    explanation:
      "5原則は、通貨払い・直接払い・全額払い・毎月1回以上払い・一定期日払いです。毎週払いであることは原則の要件ではありません。",
    source: labor,
  },
  {
    id: "base-3",
    category: categories[0],
    title: "欠勤控除の計算",
    prompt:
      "この設問では、欠勤1日あたりの控除額を「月額基本給÷月の所定労働日数」とします。基本給240,000円、所定20日、欠勤2日の控除額は？",
    choices: ["12,000円", "20,000円", "24,000円", "48,000円"],
    answer: 2,
    explanation:
      "まず1日あたり12,000円を算出し、欠勤日数の2日を掛けます。欠勤控除の方法は実際には就業規則等によって異なります。",
    formula: "240,000 ÷ 20 × 2 = 24,000円",
  },
  {
    id: "base-4",
    category: categories[0],
    title: "総支給額の計算",
    prompt:
      "基本給220,000円、資格手当15,000円、時間外手当18,000円、通勤手当8,000円の場合、総支給額は？",
    choices: ["235,000円", "253,000円", "261,000円", "243,000円"],
    answer: 2,
    explanation: "総支給額は控除前のすべての支給項目の合計です。",
    formula: "220,000 + 15,000 + 18,000 + 8,000 = 261,000円",
  },
  {
    id: "time-1",
    category: categories[1],
    title: "時間外手当の計算",
    prompt:
      "1時間あたりの基礎賃金が1,600円。割増率を25%とする時間外労働を10時間したとき、時間外手当はいくらですか。",
    choices: ["4,000円", "16,000円", "20,000円", "24,000円"],
    answer: 2,
    explanation:
      "通常の賃金100%に割増分25%を加えた125%を掛けます。割増分だけの4,000円ではなく、時間外手当全体を求めます。",
    formula: "1,600 × 1.25 × 10 = 20,000円",
  },
  {
    id: "time-2",
    category: categories[1],
    title: "深夜労働の計算",
    prompt:
      "基礎時給1,400円。通常勤務時間内に深夜労働を4時間行いました。深夜割増率を25%とすると、通常賃金に加算する割増分のみはいくらですか。",
    choices: ["1,400円", "5,600円", "7,000円", "2,800円"],
    answer: 0,
    explanation:
      "この問題は割増分のみを尋ねています。通常賃金分を含む1.25ではなく0.25を掛けます。",
    formula: "1,400 × 0.25 × 4 = 1,400円",
  },
  {
    id: "time-3",
    category: categories[1],
    title: "休日労働の計算",
    prompt:
      "基礎時給2,000円、法定休日労働5時間。割増率を35%とすると、休日労働分の賃金総額はいくらですか。",
    choices: ["3,500円", "10,000円", "12,500円", "13,500円"],
    answer: 3,
    explanation:
      "設問で指定した割増率35%を使い、通常の賃金の135%を計算します。",
    formula: "2,000 × 1.35 × 5 = 13,500円",
  },
  {
    id: "time-4",
    category: categories[1],
    title: "基礎時給の計算",
    prompt:
      "割増賃金の計算基礎となる月額賃金が256,000円、月平均所定労働時間が160時間。この設問の基礎時給は？",
    choices: ["1,400円", "1,500円", "1,600円", "1,800円"],
    answer: 2,
    explanation:
      "月給制の基礎時給は、この設問では計算基礎となる月額賃金を月平均所定労働時間で割ります。",
    formula: "256,000 ÷ 160 = 1,600円",
  },
  {
    id: "ins-1",
    category: categories[2],
    title: "保険料の計算",
    prompt:
      "2026年9月分の協会けんぽ東京支部の健康保険料率（医療分）は労使合計9.85%、労使折半です。介護保険料・支援金を含めず、標準報酬月額300,000円の場合、本人負担額は？",
    choices: ["14,775円", "29,550円", "15,000円", "17,550円"],
    answer: 0,
    explanation:
      "2026年度の東京支部の医療分料率9.85%で計算します。介護保険料と子ども・子育て支援金はこの設問では計算しません。健康保険の料率は都道府県・保険者で異なります。",
    formula: "300,000 × 9.85% ÷ 2 = 14,775円",
    source:
      "https://www.kyoukaikenpo.or.jp/~/media/Files/shared/hokenryouritu/r8/ippan/R8_13tokyo.pdf",
  },
  {
    id: "ins-2",
    category: categories[2],
    title: "定時決定の対象月",
    prompt:
      "標準報酬月額の定時決定では、原則として何月から何月までに支払われた報酬を用いますか。",
    choices: ["1月〜3月", "4月〜6月", "7月〜9月", "10月〜12月"],
    answer: 1,
    explanation:
      "原則として4月・5月・6月に支払われた報酬をもとに決定します。支払基礎日数などの要件や例外もあります。",
    source: pension,
  },
  {
    id: "ins-3",
    category: categories[2],
    title: "定時決定の適用時期",
    prompt:
      "定時決定で決まった標準報酬月額は、原則として何月から適用されますか。",
    choices: ["4月", "7月", "9月", "翌年1月"],
    answer: 2,
    explanation:
      "定時決定された標準報酬月額は、原則としてその年の9月から翌年8月まで適用されます。随時改定などに該当する場合は途中で変わります。",
    source: pension,
  },
  {
    id: "ins-4",
    category: categories[2],
    title: "雇用保険料の計算",
    prompt:
      "2026年度・一般の事業の雇用保険の本人負担率は0.5%です。対象賃金280,000円の本人負担額は？",
    choices: ["140円", "1,400円", "14,000円", "2,800円"],
    answer: 1,
    explanation:
      "百分率を小数に直すと0.005です。2026年度の一般の事業の労働者負担率は5/1,000です。事業の種類や年度が変われば率を再確認します。",
    formula: "280,000 × 0.005 = 1,400円",
    source: "https://www.mhlw.go.jp/stf/newpage_71570.html",
  },
  {
    id: "tax-1",
    category: categories[3],
    title: "課税対象額の計算",
    prompt:
      "この設問では、総支給額300,000円のうち非課税通勤手当10,000円、社会保険料等控除額43,000円とします。社会保険料等控除後の給与等の金額は？",
    choices: ["290,000円", "257,000円", "247,000円", "300,000円"],
    answer: 2,
    explanation:
      "総支給額から、設問で非課税とした通勤手当と社会保険料等を差し引きます。実際の源泉徴収税額は該当する税額表で確認します。",
    formula: "300,000 − 10,000 − 43,000 = 247,000円",
  },
  {
    id: "tax-3",
    category: categories[3],
    title: "控除合計の計算",
    prompt:
      "健康保険料15,000円、厚生年金保険料27,450円、雇用保険料1,500円、所得税6,000円、住民税12,000円。控除合計は？",
    choices: ["43,950円", "49,950円", "61,950円", "64,950円"],
    answer: 2,
    explanation:
      "提示されたすべての控除額を合計します。ここで使う金額は練習用の数値です。",
    formula: "15,000 + 27,450 + 1,500 + 6,000 + 12,000 = 61,950円",
  },
];

export const edition = {
  year: 2026,
  legalAsOf: "2026-09-01",
  checkedAt: "2026-11-01",
  label: "2026年度版・2級",
  officialScope: "https://jitsumu-up.jp/about/",
  officialExam: "https://fos.or.jp/shikaku/pc2/",
} as const;
export const questions: Question[] = [
  ...initialQuestions.map((q) => ({
    ...q,
    kind: (q.formula ? "calculation" : "knowledge") as QuestionKind,
    level: 2 as const,
  })),
  ...additionalQuestions,
];
