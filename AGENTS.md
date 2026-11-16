# 市場リスクのストレステスト・デモ

## 何を作るか

銀行のマーケット部門（Rates・FX・Equity・Credit の 4 デスク）が、ストレスシナリオをかけたときのデスク別の損益を出して、リスク委員会に出すまでを短くするプロトタイプ。合成データを取り込むところから、業務の担当が App で結果を見て承認するところまでを、1 本の流れでつなぐ。

- Outcome Map 上の位置: Capital Markets（Sellside）→ Protect the firm → Risk management →「Market & Credit Risk / Stress Testing & VaR」。Banking の「CECL/CCAR stress testing」にも近い（FY27 Industry Data Intelligence Outcome Maps）。
- 提出の要件: 6 つの段階（Lakeflow・Unity Catalog・Lakebase・ML/GenAI・Genie・App）をつなぐこと、動いた証拠を文字で残すこと、デプロイしたものを英語のデッキで説明すること。

## 流れ（1 段階につき、作るものは 1 つ）

| 段階 | 作るもの | 置き場所 |
|---|---|---|
| 合成データ | ポジションとシナリオの CSV を Volume に書く | `notebooks/00_generate_data.ipynb` |
| Lakeflow | SQL の宣言型パイプライン。bronze → silver → gold（シナリオ × デスク × リスクファクターの損益）。作成と実行は `notebooks/01_pipeline.ipynb` | `pipeline/bronze.sql`・`silver.sql`・`gold.sql` |
| Unity Catalog | カウンターパーティの列にマスク（`risk_admins` 以外は `REDACTED`）。関数は 00 で作り、silver の定義で付ける | `notebooks/00_generate_data.ipynb`・`pipeline/silver.sql` |
| GenAI | `ai_query` で、シナリオごとに委員会向けのコメントを 3 文で作る（損失の大きいデスクとリスクファクター上位 2 つ、理由、確かめること。2026-11-16 ユーザー了承）。パイプラインの gold の 1 つ（`gold_commentary`）。デスクごとのリミット（値はエージェントが決めてよいとユーザー了承）と比べた `gold_desk_stress` も足した | `pipeline/gold.sql` |
| Lakebase | `gold_desk_stress` と `gold_commentary` を synced table で同期する。承認のテーブルを 1 つ。Lakebase のデータベースを UC のカタログに登録して、承認を UC から読めるようにする（`databricks postgres create-catalog`） | `notebooks/02_lakebase.ipynb` |
| Genie | gold 3 つと承認（Lakebase のカタログ）を見る Genie space。質問の例は 5 つ。App の画面にもチャットを入れる（2026-11-16 ユーザー了承。層のつながりを 1 画面で見せるため） | `genie/space.json`・`notebooks/03_genie.ipynb` |
| App | AppKit で 1 画面。シナリオごとの結果、コメント、承認のボタン、Genie のチャット | `app/` |

App は gold とコメントを Lakebase の synced table から読み、承認も Lakebase に書く（読むのも書くのも Lakebase。SQL warehouse から読む案より部品は増えるが、「operational serving」をそのまま見せられるため。2026-11-16 ユーザー了承）。承認は Lakebase のカタログを通して UC から読む。Delta に戻すパイプラインは作らない。Genie からこのカタログの表を読めるかは要確認（読めなければ、Genie は gold とコメントだけを見る）。

損益は、感応度 × ショックで出す（`pnl = sensitivity × shock`）。SQL の JOIN 1 つで済む。

## 合成データ

- `positions.csv`（200 行ほど）: `position_id`, `desk`, `instrument_type`, `risk_factor`, `sensitivity_jpy`（ショック 1 単位あたりの損益）, `notional_jpy`, `counterparty`
- `scenarios.csv`（4 シナリオ × 8 リスクファクター）: `scenario_id`, `scenario_name`, `risk_factor`, `shock`
- リスクファクターは 8 つ（例: `JPY_IR_10Y`, `USD_IR_10Y`, `USDJPY`, `EURJPY`, `NIKKEI225`, `SPX`, `JP_CREDIT_A`, `US_CREDIT_BBB`）。
- シナリオは 4 つ（例: 日銀の 100bp の利上げ、15% の円高、世界的な株安、クレジットスプレッドの拡大）。
- 乱数は seed を固定する。実在の顧客・取引・人の名前は使わない。

## 名前（2026-11-16 ユーザー了承）

- UC のカタログ: `stress_demo`
- Lakebase のプロジェクト: `stress-demo`
- Lakebase を登録した UC のカタログ: `stress_demo_lakebase`

## ストーリーの前提（2026-11-16。ユーザー「想定でいいです」）

- 顧客は架空の Kaito Bank（日本の商業銀行のマーケット部門）。聞き手は CRO（役員・予算）と Head of Market Risk（業務の担当）。
- 成果の数字は想定で、README の 2 章に前提ごと書いた（委員会の資料に 5 営業日・24 人日／回、年 18 回 → 当日・3 人日／回、年 378 人日 ≈ 1.6 FTE ≈ 2,400 万円）。顧客の実際の値に置き換える前提。

## 提出物と順番（2026-11-16 ユーザー指示）

提出のタブは 2 つで、順番はどちらが先でもよい。「Submission - Build」には、成果物（公開のリポジトリ・デッキ）と説明文（narrative）を出し、確認の欄にチェックを入れる。「Submission - AI role-play」では、Yoodli のロールプレイで、ビジネスと技術の担当（どちらも AI）に向けてデモをする。

1. ビルド（このリポジトリ）と、説明文（README と同じ中身にする）
2. デモができたら、発表の資料を 3 枚ほど（買い手の KPI で成果から入る。役員と業務の担当の両方に向ける）
3. デモの台本（ロールプレイ用。Tell-show-tell で、ビジネスと技術の両方の担当からの質問と反論への答えも用意する）

## 評価と README の形

評価は「不合格・合格・強く合格」の 3 段階。分野ごとの点とフィードバックが返り、何度でも出し直せる。なので最初から全部を詰めず、出してフィードバックで直す。

評価はローカルのフォルダから読まれる（GitHub の URL は参照用）。読まれるのはコード・文書・実行のログ・PDF で、画像やバイナリは読まれない。だから証拠はテキストで置く。

README は、提出のフォームの欄と同じ順に章を立てて、フォームにはそこから写す。

| README の章 | フォームの欄 |
|---|---|
| Customer / Industry | Customer name（架空の銀行。名前は要確認）・Industry / vertical |
| 1. Business challenge | What is the business challenge you are solving? |
| 2. Business outcomes and impact | What are the business outcomes and impact?（数字で。見積もりなら見積もりと書き、前提も書く） |
| 3. Solution and data journey | How does your Databricks solution address this challenge?（生データ → Lakeflow → UC → Lakebase → GenAI → Genie → App を図と表で。仕組みの話はここから） |
| 4. Evidence it ran | （フォームの欄はない。`evidence/` とノートブックの出力への案内） |
| 5. AI tools, workflow, decisions and trade-offs | What AI tools did you use, and what was your workflow? What decisions and trade-offs...?（このファイルと `~/.claude/rules/simplicity.md` の考え方、「作らないもの」、捨てた案と理由） |

フォームの欄の順は「課題 → 解き方 → AI と判断 → 成果」だが、README では成果を課題のすぐあとに置く（評価する側が最初に読むところで価値が分かるように）。

フォームの「AI Customer Challenge build（NorthPeak Retail、Meridian Bank など）」のチェックは、この案件では付けない。これは用意された架空の顧客の課題を使う場合の欄で、その場合は学習してサービングした ML のモデルが要る。この案件は自分で選んだ課題で、GenAI（`ai_query`）で要件の「ML or Gen AI」を満たす。

**出す前に確かめる 3 つ（よくある不合格の理由）:**

- 顧客の問題を解いているか（社内の問題になっていないか）
- 層がつながっているか（各段階の出力が次の段階の入力になっていることを、表名で追えるか）
- 説明が、仕組みより先にビジネスの価値を語っているか

ロールプレイは、デッキを開いて声に出して練習する（Tell-show-tell、ビジネスと技術の両方からの反論に答える）。

## 不正の決まり（提出のときに確認の欄にチェックを入れる）

- 自分で作ったものだけを出す。go/solution-builder や、ほかの人のビルド・過去の提出物は使わない。AI の道具は使ってよいが、中身の判断と説明は作る人のものであること。
- そのため、エージェントは選ぶところ（題材・名前・作らないもの・KPI・ストーリー）を勝手に決めず、ユーザーに聞く。決まったことは、日付と「ユーザー了承」をつけてこのファイルに残す。
- デッキ・説明文・台本は、ユーザーの経験（現場の困りごと、委員会で聞かれること）を聞いてから下書きし、ユーザーが自分の言葉に直す。
- ビルドに使った AI の会話の ID は控えておく（疑われたときに求められる）。

## ワークスペース

- CLI のプロファイルは `DEFAULT`（Azure）。
- このメタストアにはストレージのルートがないので、カタログ `stress_demo` はワークスペースの既定のストレージ（外部ロケーション）の下を置き場所にして、CLI で 1 回だけ作った（2026-11-16）。ストレージの URL はリポジトリに書かない。
- ノートブックはローカルの `.venv`（Python 3.12・Databricks Connect）から `jupyter nbconvert --execute` で実行し、出力ごとコミットする。00 で合成データを作り直すので、01 のパイプラインは毎回フルリフレッシュする。Lakebase のプロジェクトを UC のカタログに登録できることは確かめた（2026-11-16）。
- このワークスペースには、ほかの案件のカタログや Lakebase のプロジェクトがある。この案件では新しく作ったものだけを使い、ほかのものには触らない。
- ワークスペースの URL は、リポジトリに書かない（CLI のプロファイルから読む）。

## 作り方の決まり

全体の原則（KISS・YAGNI・DRY）は `~/.claude/rules/simplicity.md`。この案件で具体的にするとこうなる。

- **KISS:** 損益は感応度 × ショックだけで出す。フル・リバリュエーション、VaR、時系列のマーケットデータは作らない。App は 1 画面。
- **YAGNI:** 下の「作らないもの」は作らない。足したくなったら、作らずにここに書き足して、ユーザーに聞く。
- **DRY:** カタログ名・スキーマ名・Volume のパス・warehouse の ID・モデルのエンドポイント名は `config.yml` の 1 か所に置き、ノートブックと App はそれを読む。
- **Walking Skeleton:** まず合成データ → パイプライン → gold → Lakebase の synced table → App の 1 画面（表 1 つ）を通して、ワークスペースにデプロイする。そのあとに GenAI・承認・Genie を 1 つずつ足す。
- **動いた証拠は文字で残す:** ノートブックは出力つきでコミットする。パイプラインと App は、実行の結果（イベントログのクエリの結果、smoke test の出力、Genie の質問と答え）を `evidence/` にテキストで置く。画像だけでは証拠にならない。

## 作らないもの（考慮済みだが未実装）

- App からの新しいシナリオの登録と、計算のやり直し（Job の起動と、Lakebase から Delta への戻しが要り、コードが増えるため）
- VaR・Expected Shortfall・フル・リバリュエーション
- 機械学習のモデルの学習（GenAI は `ai_query` だけ）
- 複数画面、ログイン画面、独自の API（SELECT は AppKit の `config/queries/` で書く）
- CI、テストのフレームワーク（App の smoke test は除く）

## 言語と公開

- リポジトリは公開する。コード・README・ノートブック・コメントは英語で書く。この AGENTS.md は作る人のためのものなので日本語のまま。
- 顧客の名前、社内の案件名、社内の URL は入れない。push の前に、調べる語の一覧で `git grep -niE` をかけて確かめる（一覧は公開されるので、リポジトリの外に置く）。
