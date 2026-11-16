# デモの台本（逐訳）

`demo_script.md` の英語のセリフを 1 文ずつ区切り、すぐ下に日本語訳を付けたもの。練習用です。本番は英語で話します。

画面は 1 ページです。上から下へ 1 回スクロールし（表 → 円高のカード → スプレッド拡大のカード → Genie のチャット）、最後にパイプラインのタブに切り替えます。

---

## 1. つかみ（1 分）：顧客・課題・これから見せるもの

> Thank you both.
> お二人とも、ありがとうございます。

> Kaito Bank's risk committee reviews stress tests every month and every time markets move.
> Kaito Bank のリスク委員会は、毎月、そして相場が動くたびに、ストレステストの結果を見ています。

> Today the pack takes about five days.
> 今は、その資料を作るのに 5 日ほどかかっています。

> So the committee decides on numbers that are a week old, and a desk breach under stress shows up late.
> そのため委員会は 1 週間前の数字で判断していて、ストレス時のデスクのリミット超えに気づくのも遅れます。

> In the next ten minutes I'll show the committee's screen for a stress run.
> これから 10 分で、ストレステストを流したときの委員会の画面をお見せします。

> We'll see which desks breach, read a draft commentary, ask a follow-up question live, and record a decision.
> どのデスクが超過しているかを見て、コメントの下書きを読み、その場で追加の質問をして、判断を記録します。

> Then we'll look at what that means for your KPIs.
> そのあとで、それが皆さまの KPI にとってどういう意味を持つかを見ます。

## 2. Tell（1 分）：デッキの 1 枚目

> The goal is a same-day pack instead of five days, and breaches visible the day the pipeline runs.
> 目標は、5 日かかっている資料を当日に出すこと、そしてリミット超えを、パイプラインが流れたその日に見えるようにすることです。

> By our estimate that is about 1.6 analyst FTE a year.
> 私たちの見積もりでは、アナリストの年 1.6 人分にあたります。

> Those are assumptions, and the pilot's first job is to measure them.
> これは想定なので、パイロットではまずこの数字を実際に測ります。

## 3. Show（7 分）

### a. 委員会の資料（App の一番上の表）　約 1 分

> This is what the committee opens.
> これが、委員会が開く画面です。

> The worst case is a global equity sell-off: minus JPY 14.3 billion across desks.
> 最悪のケースは世界的な株安で、全デスク合計で 143 億円の損失です。

> Two desks breach.
> 2 つのデスクがリミットを超えています。

> FX is at 146% of its limit if the yen surges 15%, and Credit is at 123% if spreads widen.
> 円が 15% 上がると FX がリミットの 146%、スプレッドが広がると Credit が 123% です。

> Equity is at 99% in the sell-off, at its limit with no headroom.
> 株安のときの Equity は 99% で、リミットいっぱい、余裕がありません。

**ビジネスの要点:**
> This used to be the end of a five-day process. Now it's the start of the meeting.
> これまでは 5 日かけてやっと最後に出てきたものが、いまは会議の最初に出ています。

### b. AI のコメントの下書き（円高のカード）　約 1 分

> For every scenario the platform drafts the commentary the analysts used to write.
> どのシナリオについても、これまでアナリストが書いていたコメントを、仕組みが下書きします。

> It names the desk and the two risk factors, USD/JPY and EUR/JPY, says why, and says what the committee must decide.
> どのデスクかと、効いている 2 つのリスクファクター（ドル円とユーロ円）を挙げ、その理由と、委員会が何を決めるべきかを書きます。

> It may use only these stored facts, and the screen says so: AI-generated, verify.
> 使ってよいのは保存してある事実だけで、画面にもそう出ています。「AI が作成、要確認」です。

**ビジネスの要点:**
> The analysts review and challenge. They don't type.
> アナリストは確かめて、問いただす役になります。文章を打つ必要はありません。

### c. 判断を記録する（スプレッド拡大のカードまでスクロール）　約 1 分

操作: メモに *"Credit desk to cut US BBB exposure below limit by next committee"*（Credit デスクは、次の委員会までに US BBB の持ち高をリミット以下に減らす）と入力し、**Request action** を押す。

> The decision is written to Lakebase, the operational database, with my name and the time.
> この判断は、業務用のデータベースである Lakebase に、私の名前と時刻つきで書き込まれます。

### d. その場で追加の質問（Genie のチャットまでスクロール）　約 2 分

質問: *"What are the top 3 risk factors behind the loss in the yen surge scenario?"*（円高のシナリオで、損失の要因の上位 3 つのリスクファクターは？）

> This is the question that used to go back to the team for a day.
> これは、これまでならチームに持ち帰って 1 日かかっていた質問です。

> Genie answers from the same governed tables: USD/JPY minus 7.2 billion, EUR/JPY minus 4.4, Nikkei minus 1.3.
> Genie は、同じ管理されたテーブルから答えます。ドル円がマイナス 72 億円、ユーロ円がマイナス 44 億円、日経がマイナス 13 億円です。

> Here is the SQL it ran, so anyone can check it.
> Genie が実行した SQL もここにあるので、誰でも確かめられます。

**技術の担当に向けて:**
> It runs on behalf of the signed-in user, so Unity Catalog applies my own permissions, including the counterparty mask.
> これはサインインしている人の権限で動くので、Unity Catalog は私自身の権限を適用します。カウンターパーティのマスクも効きます。

### e. 1 つのつながった仕組みであることを見せる（同じチャットで次の質問）　約 1 分

質問: *"Which scenarios have not been signed off by the committee yet?"*（委員会がまだ承認していないシナリオは？）

> The decision I just made is already there.
> いま私が入れた判断が、もうここに出ています。

> Genie joins the lakehouse results with the decision in Lakebase through Unity Catalog.
> Genie が、Unity Catalog を通して、レイクハウスの結果と Lakebase の判断を結合しています。

> No export and no second copy.
> データの書き出しも、2 つめのコピーもありません。

### f. 裏側（技術の担当向け、パイプラインのタブ）　約 1 分

> Raw files land in a volume.
> 元のファイルは、Volume に置かれます。

> The Lakeflow pipeline applies quality rules: two bad rows were dropped and counted in the event log.
> Lakeflow のパイプラインが品質のルールを当てていて、不正な 2 行が落とされ、その件数がイベントログに残っています。

> Gold computes P&L by desk against limits and the AI commentary.
> gold の層で、デスクごとの損益とリミットの比較、そして AI のコメントを作ります。

> Lakebase serves the app and stores decisions, and it is registered in Unity Catalog.
> Lakebase は App にデータを出し、判断を保存します。そして Unity Catalog に登録されています。

> Lineage runs from file to screen.
> ファイルから画面まで、データの系譜がつながっています。

## 4. Tell（1 分）：それが何を意味するか

> So for the CRO: the committee decides on today's risk, and a breach like the FX one surfaces the day it happens, not five days later.
> つまり CRO にとっては、委員会が今日のリスクで判断でき、FX のような超過が、5 日後ではなく起きたその日に見えるようになります。

> For the Head of Market Risk: the team gets its week back to challenge the desks.
> マーケットリスクの責任者にとっては、チームの 1 週間が戻ってきて、デスクに問いかけることに使えます。

> I propose a six-week pilot on the FX desk, with your real sensitivities, run alongside the next committee.
> FX デスクで、実際の感応度を使い、次の委員会と並行して動かす、6 週間のパイロットをご提案します。

> Can we agree to start, with a named data owner?
> データの責任者を 1 人決めていただいて、始めることに合意いただけますか。

---

## 5. 質疑と反論

聞いた人の目線で答えます。CRO が技術のことを聞いたら、まずビジネスの答えを言い、技術は 1 文だけ足します。技術の担当が聞いたら、詳しく答えてから、ビジネスにとっての意味を 1 文で足します。

### CRO から（費用・リスク・効果が出るまでの期間）

**Q. What does it cost?**（費用はいくらか）
> Pay per use.
> 使った分だけの課金です。

> The pipeline is serverless, and the database and app scale down when idle.
> パイプラインはサーバーレスで、データベースと App は使っていないときは縮みます。

> I won't quote a number before the pilot.
> パイロットの前に金額を言うのは控えます。

> We'll measure real cost on the FX desk and set it against the roughly JPY 24 million of analyst time.
> FX デスクで実際の費用を測り、アナリストの工数の約 2,400 万円と比べます。

**Q. How sure are you about 1.6 FTE?**（1.6 人分はどこまで確かか）
> It's an estimate from 18 cycles a year and 24 person-days each.
> 年 18 回、1 回あたり 24 人日からの見積もりです。

> The pilot measures the real cycle time and effort, and we decide on that.
> パイロットで実際の所要日数と工数を測り、それをもとに判断します。

**Q. What if the AI writes something wrong?**（AI が間違ったことを書いたら）
> It drafts and people decide.
> AI が書くのは下書きで、決めるのは人です。

> It may only use the numbers stored next to it, the screen marks it as AI, and the sign-off is a human action with name and time.
> 使ってよいのは隣に保存した数字だけで、画面には AI だと表示され、承認は人の操作として名前と時刻が残ります。

**Q. How long until value?**（効果が出るまでどれくらいか）
> Six weeks to a measured go / no-go on one desk.
> 6 週間で、1 つのデスクについて、測った結果をもとに続けるかどうかを決められます。

> The connected flow already runs, so we spend the pilot on your data, not on building.
> つながった仕組みはもう動いているので、パイロットの時間は、作ることではなく、皆さまのデータに使えます。

**Q. Do we have to replace our risk engine?**（リスクエンジンを置き換える必要があるか）
> No. We take the sensitivities your engine already exports.
> いいえ。エンジンがすでに書き出している感応度を取り込みます。

> The engine stays the source of truth for valuation.
> 評価の正しい値の出どころは、引き続きエンジンです。

**Q. Is this regulatory-grade?**（規制の提出に耐えるか）
> It's a decision-support pack with lineage, logged data quality and recorded sign-off, which helps with audit.
> これは意思決定を支える資料で、データの系譜、記録されたデータの品質、記録された承認があるので、監査の役に立ちます。

> Regulatory submissions stay in your existing process until you decide otherwise.
> 規制への提出は、皆さまが変えると決めるまで、今の流れのままです。

### 技術の担当から（構成・データの品質・セキュリティ・既存の仕組みとのつなぎ）

**Q. Why Lakebase and not the SQL warehouse?**（なぜ SQL warehouse でなく Lakebase か）
> The committee screen needs sub-second reads and transactional writes for decisions.
> 委員会の画面には、1 秒かからない読み込みと、判断を書くためのトランザクションが要ります。

> Synced tables serve gold to Postgres, and the app's own table stores decisions.
> synced table が gold を Postgres に届け、App 自身のテーブルが判断を保存します。

> Registering Lakebase in Unity Catalog lets Genie and the lakehouse read the decisions with no reverse pipeline.
> Lakebase を Unity Catalog に登録しているので、逆向きのパイプラインなしで、Genie とレイクハウスから判断を読めます。

**Q. How do you control data quality?**（データの品質はどう管理するか）
> Expectations in the pipeline drop invalid rows, like an unknown desk or a missing sensitivity.
> パイプラインの expectations が、知らないデスク名や感応度の抜けといった不正な行を落とします。

> The pass and fail counts are in the event log.
> 通った件数と落ちた件数は、イベントログに残ります。

> In the pilot we add reconciliation against today's pack.
> パイロットでは、今の資料との突き合わせも足します。

**Q. Security and access?**（セキュリティとアクセスは）
> Unity Catalog governs everything.
> すべてを Unity Catalog が管理しています。

> Counterparty is masked by a column mask.
> カウンターパーティは、列のマスクで隠しています。

> Genie runs on behalf of the user.
> Genie は、使っている人の権限で動きます。

> The app's service principal has no Unity Catalog grants; it can only read the synced gold and write decisions in Lakebase.
> App のサービスプリンシパルには Unity Catalog の権限がなく、できるのは Lakebase で同期した gold を読むことと、判断を書くことだけです。

> Synced tables don't carry UC masks, which is why only gold, with no counterparty column, is synced.
> synced table には UC のマスクが引き継がれないので、カウンターパーティの列を持たない gold だけを同期しています。

**Q. How does it connect to our systems?**（既存の仕組みとどうつなぐか）
> In the pilot, from files your risk engine exports, through Auto Loader.
> パイロットでは、リスクエンジンが書き出すファイルを Auto Loader で読みます。

> Later, from databases with Lakeflow Connect or from your existing jobs.
> その先は、Lakeflow Connect でデータベースから、あるいは今あるジョブから取り込めます。

> No change to the engine.
> エンジンは変えません。

**Q. Sensitivity × shock is too simple.**（感応度 × ショックは単純すぎる）
> Agreed for options.
> オプションについては、おっしゃるとおりです。

> It's a first-order view, fine for linear books and fast for the committee.
> これは一次の近似で、線形の帳簿には十分ですし、委員会向けには速く出せます。

> Full revaluation replaces one gold step.
> フル・リバリュエーションに置き換えるのは、gold の 1 ステップだけです。

> Everything after it, the app, Lakebase and Genie, stays the same.
> そのあとの App・Lakebase・Genie は、すべてそのまま使えます。

**Q. How do you stop the LLM from inventing numbers?**（LLM が数字を作らないようにするには）
> The prompt gets only a facts string built in SQL, and that string is stored next to the output, so each sentence can be checked.
> プロンプトに渡すのは SQL で作った事実の文字列だけで、その文字列を出力の隣に保存しているので、1 文ずつ確かめられます。

> Generation runs once per pipeline run, not on page load, so the text is the same for everyone.
> 生成はパイプラインを流すたびに 1 回だけで、画面を開くたびではないので、誰が見ても同じ文章です。

**Q. What about lock-in?**（ロックインは）
> Data is Delta in your storage, and Lakebase is standard Postgres.
> データは皆さまのストレージに���る Delta で、Lakebase は標準の Postgres です。

> Both are open formats you can read with other tools.
> どちらもオープンな形式で、ほかの道具からも読めます。

**Q. Scale?**（規模は大丈夫か）
> The sample is 200 positions.
> このサンプルは 200 ポジションです。

> The pipeline and the warehouse are serverless and scale with volume.
> パイプラインと warehouse はサーバーレスで、量に合わせて伸びます。

> In the pilot we test with the FX desk's full book.
> パイロットでは、FX デスクの全ポジションで確かめます。
