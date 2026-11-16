# Demo script: AI role-play (about 12 minutes plus Q&A)

In the room: the **CRO** (business, funds the decision) and the **data architect / head of risk data** (technical, has to run it).
Structure: tell → show → tell. Keep the demo tight and land every screen on a business point.

## Before you start (5 minutes before)

- Open the app `stress-demo` and wait for the table to load. That wakes Lakebase and the app.
- In the Genie chat, ask one question so the warehouse is warm. Then click "New conversation".
- Keep `deck/deck.md` open on slide 1, and the pipeline graph (Jobs & Pipelines → `stress-demo-pipeline`) open in another tab.
- Have the yen surge (S2) and credit spreads (S4) scenario cards in mind. S4 has no decision yet, so you will record one live.

## 1. Set up (1 minute): customer, problem, what I will show

> "Thank you both. Kaito Bank's risk committee reviews stress tests every month and every time markets move. Today the pack takes about five days. So the committee decides on numbers that are a week old, and a desk breach under stress shows up late.
> In the next ten minutes I'll show the committee's screen for a stress run. We'll see which desks breach, read a draft commentary, ask a follow-up question live, and record a decision. Then we'll look at what that means for your KPIs."

## 2. Tell (1 minute): slide 1

> "The goal is a same-day pack instead of five days, and breaches visible the day the pipeline runs. By our estimate that is about 1.6 analyst FTE a year. Those are assumptions, and the pilot's first job is to measure them."

## 3. Show (7 minutes)

**a. The committee pack (app, top table).** About 1 minute.
> "This is what the committee opens. The worst case is a global equity sell-off: minus JPY 14.3 billion across desks. Two desks breach. FX is at 146% of its limit if the yen surges 15%, and Credit is at 123% if spreads widen. Equity is at 99% in the sell-off, at its limit with no headroom."
**Business point:** "This used to be the end of a five-day process. Now it's the start of the meeting."

**b. The AI draft commentary (yen surge card).** About 1 minute.
> "For every scenario the platform drafts the commentary the analysts used to write. It names the desk and the two risk factors, USD/JPY and EUR/JPY, says why, and says what the committee must decide. It may use only these stored facts, and the screen says so: AI-generated, verify."
**Business point:** "The analysts review and challenge. They don't type."

**c. A follow-up question, live (Genie chat).** About 2 minutes.
Ask: *"What are the top 3 risk factors behind the loss in the yen surge scenario?"*
> "This is the question that used to go back to the team for a day. Genie answers from the same governed tables: USD/JPY minus 7.2 billion, EUR/JPY minus 4.4, Nikkei minus 1.3. Here is the SQL it ran, so anyone can check it."
For the architect: "It runs on behalf of the signed-in user, so Unity Catalog applies my own permissions, including the counterparty mask."

**d. Record the decision (credit spreads card).** About 1 minute.
Type the note *"Credit desk to cut US BBB exposure below limit by next committee"* and click **Request action**.
> "The decision is written to Lakebase, the operational database, with my name and the time."

**e. Show it's one connected system (Genie again).** About 1 minute.
Ask: *"Which scenarios have not been signed off by the committee yet?"*
> "The decision I just made is already there. Genie joins the lakehouse results with the decision in Lakebase through Unity Catalog. No export and no second copy."

**f. Under the hood, for the architect (pipeline tab).** About 1 minute.
> "Raw files land in a volume. The Lakeflow pipeline applies quality rules: two bad rows were dropped and counted in the event log. Gold computes P&L by desk against limits and the AI commentary. Lakebase serves the app and stores decisions, and it is registered in Unity Catalog. Lineage runs from file to screen."

## 4. Tell (1 minute): what it means

> "So for the CRO: the committee decides on today's risk, and a breach like the FX one surfaces the day it happens, not five days later. For the Head of Market Risk: the team gets its week back to challenge the desks.
> I propose a six-week pilot on the FX desk, with your real sensitivities, run alongside the next committee. Can we agree to start, with a named data owner?"

## 5. Questions and objections

Answer at the level of the person who asked. If the CRO asks a technical question, give the business answer first and then one technical sentence. If the architect asks, give the detail, then one sentence on what it means for the business.

### From the CRO (cost, risk, time to value)

| Question | Answer |
|---|---|
| What does it cost? | "Pay per use. The pipeline is serverless, and the database and app scale down when idle. I won't quote a number before the pilot. We'll measure real cost on the FX desk and set it against the roughly JPY 24 million of analyst time." |
| How sure are you about 1.6 FTE? | "It's an estimate from 18 cycles a year and 24 person-days each. The pilot measures the real cycle time and effort, and we decide on that." |
| What if the AI writes something wrong? | "It drafts and people decide. It may only use the numbers stored next to it, the screen marks it as AI, and the sign-off is a human action with name and time." |
| How long until value? | "Six weeks to a measured go / no-go on one desk. The connected flow already runs, so we spend the pilot on your data, not on building." |
| Do we have to replace our risk engine? | "No. We take the sensitivities your engine already exports. The engine stays the source of truth for valuation." |
| Is this regulatory-grade? | "It's a decision-support pack with lineage, logged data quality and recorded sign-off, which helps with audit. Regulatory submissions stay in your existing process until you decide otherwise." |

### From the architect (architecture, data quality, security, integration)

| Question | Answer |
|---|---|
| Why Lakebase and not the SQL warehouse? | "The committee screen needs sub-second reads and transactional writes for decisions. Synced tables serve gold to Postgres, and the app's own table stores decisions. Registering Lakebase in Unity Catalog lets Genie and the lakehouse read the decisions with no reverse pipeline." |
| How do you control data quality? | "Expectations in the pipeline drop invalid rows, like an unknown desk or a missing sensitivity. The pass and fail counts are in the event log. In the pilot we add reconciliation against today's pack." |
| Security and access? | "Unity Catalog governs everything. Counterparty is masked by a column mask. Genie runs on behalf of the user. The app's service principal has no Unity Catalog grants; it can only read the synced gold and write decisions in Lakebase. Synced tables don't carry UC masks, which is why only gold, with no counterparty column, is synced." |
| How does it connect to our systems? | "In the pilot, from files your risk engine exports, through Auto Loader. Later, from databases with Lakeflow Connect or from your existing jobs. No change to the engine." |
| Sensitivity × shock is too simple. | "Agreed for options. It's a first-order view, fine for linear books and fast for the committee. Full revaluation replaces one gold step. Everything after it, the app, Lakebase and Genie, stays the same." |
| How do you stop the LLM from inventing numbers? | "The prompt gets only a facts string built in SQL, and that string is stored next to the output, so each sentence can be checked. Generation runs once per pipeline run, not on page load, so the text is the same for everyone." |
| What about lock-in? | "Data is Delta in your storage, and Lakebase is standard Postgres. Both are open formats you can read with other tools." |
| Scale? | "The sample is 200 positions. The pipeline and the warehouse are serverless and scale with volume. In the pilot we test with the FX desk's full book." |
