# Kaito Bank: same-day stress testing for the risk committee

Audience: Chief Risk Officer (executive sponsor) and Head of Market Risk (domain owner).
All figures are estimates for illustration (assumptions in the README, section 2), to be validated in the pilot. Data shown is synthetic.

---

## Slide 1. Today the committee decides on five-day-old numbers. We can make it the same day.

**Where you are today**
- A stress pack takes about 5 business days and 4 analysts: spreadsheets, reconciliation, commentary written from scratch.
- A desk limit breach under stress shows up only when the pack is done.
- Each follow-up question from the committee goes back to the team and takes 1–2 days.

| Your KPI | Today | With the solution |
|---|---|---|
| Scenario to committee pack | 5 business days | **Same day** |
| Time to see a stress limit breach | T+5 | **T+0** |
| Committee follow-up questions | 1–2 days each | **Answered in the meeting** |
| Analyst effort | 24 person-days per cycle | 3 person-days per cycle |
| Annual effect (18 cycles) | | **≈378 person-days ≈ 1.6 FTE ≈ JPY 24M a year** |

**For the CRO:** decisions on today's risk, and breaches managed about five days earlier. In the demo, the FX desk is JPY 3.6bn over its limit under a 15% yen surge.
**For the Head of Market Risk:** the team stops rebuilding the pack and spends its time challenging the desks.

> Speaker note: Start with the committee's problem, not the platform. Say clearly that the numbers are estimates and that the pilot's first job is to measure them.

---

## Slide 2. One governed flow, from the desks' data to the committee's decision

```
Desk sensitivities, scenarios, limits
  → Lakeflow pipeline: quality rules reject bad rows, and the counts are logged
  → Unity Catalog: one place for lineage, masking and permissions
  → Stressed P&L by desk vs limit, and an AI draft commentary per scenario
  → Lakebase: a fast committee screen, and the committee's decisions written back
  → Databricks App: review, sign off or request action
  → Genie: ask follow-up questions in the meeting, with the SQL shown
```

**Why you can trust it**
1. **Every number has an origin.** Each figure traces back through named tables to the raw file. Bad rows are dropped and counted, not silently fixed.
2. **The AI drafts and people decide.** The commentary may use only the facts stored next to it, and the screen marks it "AI-generated, verify". The committee's sign-off is recorded with name and time.
3. **Permissions follow the person.** Genie runs with each user's own Unity Catalog permissions. Counterparty names are masked for anyone outside risk admins.

**What it does not do (yet)**
- Stressed P&L is sensitivity × shock. That is the right first view for a committee, but it misses option convexity. Full revaluation can replace that one step later.
- It does not replace your risk engine. It takes the engine's sensitivities as input.

> Speaker note: For the architect, the detail is in the demo: expectations in the event log, the Lakebase catalog in Unity Catalog, and on-behalf-of-user Genie.

---

## Slide 3. Proposal: a 6-week pilot on the FX desk

| Weeks | What happens | You see |
|---|---|---|
| 1–2 | Load real FX sensitivities from your risk engine's export and reconcile them with the current pack | Numbers match within an agreed tolerance |
| 3–4 | Run it alongside the monthly committee | Measured time to pack, and follow-ups answered in the meeting |
| 5–6 | Security and governance review (SSO, permissions, region), then decide on rollout | Go / no-go with real cost and time data |

**Success criteria:** reconciles within tolerance, pack ready the same day, and most follow-ups answered in the meeting.
**What we need from you:** a data owner for the FX sensitivities, read access to the export, two analysts for two days a week, and one committee member to use it.

| Your concern | How we handle it |
|---|---|
| Cost | Pay per use. The pipeline is serverless, and the database and app scale down when idle. We report the pilot's actual cost |
| The AI gets it wrong | It may use only the stored facts, a person signs off, and Genie shows its SQL |
| Data quality | Quality rules with logged counts, plus reconciliation against today's pack |
| Fit with existing systems | Reads files your engine already exports. No change to the risk engine |

**Decision we ask for today:** agree to start the FX desk pilot, with a named data owner.
