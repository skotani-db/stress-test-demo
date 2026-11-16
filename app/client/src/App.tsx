import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  GenieChat,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@databricks/appkit-ui/react';

type Desk = {
  scenario_id: string;
  scenario_name: string;
  desk: string;
  pnl_jpy: number;
  limit_jpy: number;
  limit_utilization: number;
  limit_breach: boolean;
};
type Scenario = {
  scenario_id: string;
  scenario_name: string;
  commentary: string;
  decision: 'SIGNED_OFF' | 'ACTION_REQUESTED' | null;
  note: string | null;
  decided_by: string | null;
  decided_at: string | null;
};
type Data = { desks: Desk[]; scenarios: Scenario[] };

const DESKS = ['Rates', 'FX', 'Equity', 'Credit'];
const bn = (jpy: number) => (jpy / 1e9).toFixed(1);

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/stress')
      .then((r) => (r.ok ? (r.json() as Promise<Data>) : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  return (
    <main className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Stress testing: risk committee pack</h1>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load stress results</AlertTitle>
          <AlertDescription>{error}. Check that the Lakebase sync is online, then reload.</AlertDescription>
        </Alert>
      ) : data === null ? (
        <Skeleton className="h-64 w-full" />
      ) : data.desks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No stress results yet</EmptyTitle>
            <EmptyDescription>Run the pipeline and the Lakebase sync (notebooks 01 and 02).</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <StressTable desks={data.desks} />
          {data.scenarios.map((s) => (
            <ScenarioCard key={s.scenario_id} s={s} desks={data.desks} onSaved={load} />
          ))}
          <AskGenie />
        </>
      )}
    </main>
  );
}

function StressTable({ desks }: { desks: Desk[] }) {
  const scenarios = [...new Map(desks.map((d) => [d.scenario_id, d.scenario_name])).entries()];
  const total = (sid: string) => desks.filter((d) => d.scenario_id === sid).reduce((s, d) => s + d.pnl_jpy, 0);
  const [worstId, worstName] = scenarios.reduce((a, b) => (total(b[0]) < total(a[0]) ? b : a));
  const breaches = desks.filter((d) => d.limit_breach).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Worst case is “{worstName}”: JPY {bn(total(worstId))} bn. {breaches} desk limit breach
          {breaches === 1 ? '' : 'es'} to decide on.
        </CardTitle>
        <CardDescription>Stressed P&amp;L by scenario and desk, JPY bn (negative = loss), with limit use.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              {DESKS.map((d) => (
                <TableHead key={d} className="text-right">
                  {d}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map(([sid, name]) => (
              <TableRow key={sid}>
                <TableCell>{name}</TableCell>
                {DESKS.map((desk) => {
                  const d = desks.find((x) => x.scenario_id === sid && x.desk === desk);
                  if (!d) return <TableCell key={desk} />;
                  return (
                    <TableCell key={desk} className="text-right tabular-nums">
                      <div className={d.pnl_jpy < 0 ? 'text-destructive' : 'text-foreground'}>{bn(d.pnl_jpy)}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.limit_breach ? (
                          <Badge variant="destructive">{Math.round(d.limit_utilization * 100)}% of limit</Badge>
                        ) : (
                          `${Math.max(0, Math.round(d.limit_utilization * 100))}% of limit`
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-right tabular-nums font-semibold text-destructive">{bn(total(sid))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Source: Lakebase synced table risk.gold_desk_stress (Lakeflow gold layer). Sensitivity × shock
            approximation on synthetic positions.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}

function ScenarioCard({ s, desks, onSaved }: { s: Scenario; desks: Desk[]; onSaved: () => void }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const breached = desks.filter((d) => d.scenario_id === s.scenario_id && d.limit_breach).map((d) => d.desk);

  const decide = (decision: 'SIGNED_OFF' | 'ACTION_REQUESTED') => {
    setSaving(true);
    setSaveError(null);
    fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: s.scenario_id, decision, note: note || undefined }),
    })
      .then((r) => (r.ok ? onSaved() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(() => setNote(''))
      .catch((e: Error) => setSaveError(e.message))
      .finally(() => setSaving(false));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {s.scenario_name}
          {breached.map((d) => (
            <Badge key={d} variant="destructive">
              {d} limit breach
            </Badge>
          ))}
          {s.decision && (
            <Badge variant={s.decision === 'SIGNED_OFF' ? 'secondary' : 'outline'}>
              {s.decision === 'SIGNED_OFF' ? 'Signed off' : 'Action requested'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-generated commentary (ai_query, grounded on the gold facts). Verify before you rely on it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground">{s.commentary}</p>
        {s.decision && (
          <p className="text-xs text-muted-foreground">
            Last decision by {s.decided_by} at {new Date(s.decided_at ?? '').toLocaleString()}
            {s.note ? `: “${s.note}”` : ''}
          </p>
        )}
        <Textarea
          placeholder="Committee note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {saveError && <p className="text-sm text-destructive">Could not save the decision: {saveError}</p>}
      </CardContent>
      <CardFooter className="gap-2">
        <Button disabled={saving} onClick={() => decide('SIGNED_OFF')}>
          Sign off
        </Button>
        <Button variant="outline" disabled={saving} onClick={() => decide('ACTION_REQUESTED')}>
          Request action
        </Button>
      </CardFooter>
    </Card>
  );
}

function AskGenie() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/whoami')
      .then((r) => (r.ok ? (r.json() as Promise<{ email: string | null }>) : null))
      .then((me) => setEmail(me?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ask the stress results <Badge variant="secondary">{email ?? 'Signed in'}</Badge>
        </CardTitle>
        <CardDescription>
          Genie answers from the gold tables and the committee decisions above. Queries run on your behalf, so
          Unity Catalog applies your own permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-[520px]">
          <GenieChat alias="default" />
        </div>
        <p className="text-xs text-muted-foreground">
          AI-generated from your data via Genie. Open the SQL under each answer before you rely on it.
        </p>
      </CardContent>
    </Card>
  );
}
