# 追加事例問題の確認記録

確認日：2026年11月1日。教材の法令基準日：2026年9月1日。

参考画像の試験例・演習例から、正誤の組合せ、誤りの指摘、勤怠表の読解、規程・等級表・税額表の照合、給与・賞与明細の完成という出題形式を参考にした。設問の文章、架空の勤怠・賃金規程、事例、数値、選択肢、解説は独自に作成。画像の本文・解説・書き込みはアプリに転記していない。公的表の数値は制度上の事実として必要範囲のみ抜粋し、出典と単位・条件を別資料に明記した。

## 確認した公的資料と対象問題

| 対象ID | 確認内容 | 根拠 |
| --- | --- | --- |
| case-k1、case-c1・c2・c12・c13 | 賃金の支払原則、休業手当60%、減給制裁の1件・支払期の両上限。欠勤控除は設問の架空規程による | [厚生労働省・労働条件のルール](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudouseisaku/chushoukigyou/joken_kankyou_rule.html) |
| case-k2 | 月払いと甲欄・乙欄の選択 | [国税庁 No.2511](https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2511.htm) |
| case-k3、case-c3・c4・c10・c11 | 時間外・休日・深夜の区別、深夜22〜5時、月60時間超の率 | [厚生労働省・時間外休日労働](https://www.check-roudou.mhlw.go.jp/study/roudousya_jikangai.html) |
| case-k4、case-c9 | 名称でなく手当の実質で算定基礎を判断、一律住宅手当の算入、深夜の重複加算 | [大阪労働局・割増賃金](https://jsite.mhlw.go.jp/osaka-roudoukyoku/hourei_seido_tetsuzuki/roudoukijun_keiyaku/hourei_seido/jikan2/warimasi.html) |
| case-k5、case-c5 | 定時決定の対象月と17日要件（短時間等の特例を除外） | [日本年金機構・定時決定](https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20121017.html) |
| case-k6 | 年休取得日・法定育児休業期間のみなし出勤 | [厚生労働省・年休Q&A](https://www.startup-roudou.mhlw.go.jp/qa/zigyonushi/yukyu/q1.html) |
| case-k7 | 固定的賃金変動、2等級、3か月、4か月目からの改定 | [日本年金機構・随時改定](https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-02.html) |
| case-k8、case-c14・c15 | 前月給与を用いる算出率の選択、10倍超の例外、控除後賞与への乗算 | [国税庁 No.2523](https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2523.htm) |
| case-c5・c6・c15 | 等級範囲、東京医療分9.85%、介護1.62%、支援金0.23%、厚生年金18.3%の労使折半 | [協会けんぽ・2026年度東京支部保険料額表](https://www.kyoukaikenpo.or.jp/~/media/Files/shared/hokenryouritu/r8/ippan/R8_13tokyo.pdf) |
| case-c6 | 通勤手当を標準報酬の対象に含める | [日本年金機構・報酬のQ&A](https://www.nenkin.go.jp/section/faq/kounen/hyoujunhoushu/20140602-03.html) |
| case-c7・c16 | 令和8年分月額表2ページの248,000〜257,000円の甲欄0・1人 | [国税庁・月額表PDF](https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/data/01-07.pdf) |
| case-c8・c15 | 一般の事業の雇用保険労働者負担5/1,000 | [厚生労働省・令和8年度雇用保険料率](https://www.mhlw.go.jp/content/001692566.pdf) |
| case-c8 | 雇用保険の算定賃金に通勤手当を含める | [厚生労働省・対象賃金](https://www.mhlw.go.jp/new-info/kobetu/roudou/gyousei/hoken/kakikata/dl/koyou-07.pdf) |
| case-c14・c15 | 令和8年分算出率表15ページ、甲欄0人、94,000〜342,000円の必要3区分 | [国税庁・賞与算出率PDF](https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/data/15-16.pdf) |
| case-c15 | 標準賞与額の1,000円未満切捨て・上限。設問では端数も上限超過もなし | [日本年金機構・賞与](https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20141203.html) |

公的PDFは表示確認とテキストでの数値照合を実施。年金機構の定時決定ページは確認時に2026年10月6日更新となっていたため、使用する数値は2026年度の保険料額表とも照合した。基準日後の制度変更を仮定して問題に混在させてはいない。

## 解答の検算

`src/lib/questions-cases-2026.test.ts` で追加計算16問を、解説の文字列を実行せず独立した算式で検算する。特に以下を確認する。

- 時間外・深夜は分単位で集計し、休憩を除外。日ごとの切捨てはしない。
- 時間外125%と深夜25%の重複は、通常賃金部分を二重計上しない。
- 等級表の290,000円、月額表の254,000円、賞与算出率表の260,000円は下限を含む側で照合。
- 賞与の所得税は社会保険料等控除後の額に乗算して1円未満切捨て。
- case-c15は35歳で介護保険非該当。社会保険料等117,520円、所得税41,808円、差引支給640,672円。
- 問題別の表は必要範囲の抜粋であり、全額・全年齢・全制度の汎用計算表ではない。

専門家による監修ではなく、公的資料の照合と算式の検証を行った教材である。

## 実行確認

- `npm run typecheck`、`npm test`（9ファイル・42テスト）、`npm run build` が成功。
- `node scripts/reference-browser-check.mjs` が成功。360px・1440pxで別資料16問の検索、表の初期折りたたみ・開閉、ページ全体の横はみ出し防止、代表6問の計算回答と解説、正誤組合せ問題の回答を確認。表自体はキーボードでも横スクロール可能。
