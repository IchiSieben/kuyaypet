import { ArrowLeft, CalendarDays, CheckCircle2, Circle, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import { agoLabel, ISSUES_URL, MILESTONES_URL, PROJECTS_URL, REPO, REPO_URL, useGh, type GhIssue, type GhLabel, type GhMilestone } from '@/services/github';

const DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

function labelTone(name: string): string {
  if (name.startsWith('prioridad:alta')) return 'bg-coral-100/80 text-coral-600';
  if (name.startsWith('prioridad:media')) return 'bg-honey-100/80 text-honey-600';
  if (name.startsWith('prioridad:baja')) return 'bg-sage-100/80 text-sage-600';
  if (name.startsWith('tipo:')) return 'bg-terra-100/80 text-terra-600';
  return 'bg-cocoa/[.06] text-cocoa-700';
}

function sprintKey(issue: GhIssue): string {
  const l = issue.labels.find((x) => /^sprint-\d+$/.test(x.name));
  if (l) return l.name;
  if (issue.labels.some((x) => x.name === 'backlog')) return 'backlog';
  return 'sin-etiqueta';
}

function groupLabel(key: string) {
  if (key === 'backlog') return 'Backlog';
  if (key === 'sin-etiqueta') return 'Sin sprint asignado';
  return `Sprint ${key.replace('sprint-', '')}`;
}

function sortKeys(a: string, b: string) {
  const rank = (k: string) => (k.startsWith('sprint-') ? Number(k.slice(7)) : k === 'backlog' ? 900 : 999);
  return rank(a) - rank(b);
}

function LabelChips({ labels }: { labels: GhLabel[] }) {
  const shown = labels.filter((l) => l.name.startsWith('prioridad:') || l.name.startsWith('tipo:'));
  if (!shown.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {shown.map((l) => (
        <span key={l.name} className={`rounded-full px-2 py-0.5 text-2xs font-bold ${labelTone(l.name)}`}>
          {l.name.split(':')[1]}
        </span>
      ))}
    </span>
  );
}

function Avatars({ issue }: { issue: GhIssue }) {
  if (!issue.assignees.length) return null;
  return (
    <span className="flex -space-x-2" aria-label={`Asignado a ${issue.assignees.map((a) => a.login).join(', ')}`}>
      {issue.assignees.slice(0, 3).map((a) => (
        <img key={a.login} src={`${a.avatar_url}&s=48`} alt="" title={a.login} width={22} height={22} loading="lazy" className="h-[22px] w-[22px] rounded-full bg-cream-200 ring-2 ring-white" />
      ))}
    </span>
  );
}

function IssueRow({ issue }: { issue: GhIssue }) {
  const done = issue.state === 'closed';
  return (
    <li>
      <a href={issue.html_url} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 rounded-2xl px-2 py-2 hover:bg-white/80 hover:shadow-hairline">
        {done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sage" /> : <Circle size={16} className="mt-0.5 shrink-0 text-cocoa-300" />}
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-semibold leading-snug ${done ? 'text-cocoa-400 line-through decoration-cocoa-300' : ''}`}>
            <span className="mr-1.5 font-display text-cocoa-400">#{issue.number}</span>
            {issue.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <LabelChips labels={issue.labels} />
          </span>
        </span>
        <Avatars issue={issue} />
      </a>
    </li>
  );
}

function MilestoneCard({ m, issues }: { m: GhMilestone; issues: GhIssue[] }) {
  const total = m.open_issues + m.closed_issues;
  const pct = total ? Math.round((m.closed_issues / total) * 100) : 0;
  const groups = new Map<string, GhIssue[]>();
  for (const i of issues) groups.set(sprintKey(i), [...(groups.get(sprintKey(i)) ?? []), i]);
  const keys = [...groups.keys()].sort(sortKeys);
  return (
    <article className="surface-2 rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold">{m.title}</h2>
          {m.due_on && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-cocoa-500">
              <CalendarDays size={13} /> Entrega: {DATE.format(new Date(m.due_on))}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 font-display text-sm font-extrabold ${m.state === 'closed' ? 'bg-sage text-white' : 'bg-terra-100 text-terra-600'}`}>
          {m.closed_issues}/{total}
        </span>
      </div>
      {m.description && <p className="mt-2 text-sm text-cocoa-700">{m.description}</p>}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cocoa/[.08]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% completado`}>
        <motion.div className="h-full rounded-full bg-sage" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <p className="mt-1 text-right text-2xs font-bold text-cocoa-400">{pct}% cerrado</p>

      {keys.map((k) => (
        <div key={k} className="mt-3">
          <p className="eyebrow px-2">{groupLabel(k)}</p>
          <ul className="mt-1">
            {(groups.get(k) ?? []).map((i) => (
              <IssueRow key={i.number} issue={i} />
            ))}
          </ul>
        </div>
      ))}
      {!issues.length && <p className="mt-3 px-2 text-sm text-cocoa-400">Sin issues en este hito.</p>}
    </article>
  );
}

export function Sprints() {
  const navigate = useNavigate();
  const ms = useGh<GhMilestone[]>(MILESTONES_URL, 'json');
  const is = useGh<GhIssue[]>(ISSUES_URL, 'json');
  const loading = ms.loading || is.loading;
  const error = ms.error ?? is.error;
  const milestones = (ms.data ?? []).slice().sort((a, b) => a.number - b.number);
  const issues = (is.data ?? []).filter((i) => !i.pull_request);
  const unplanned = issues.filter((i) => !i.milestone);
  const stale = ms.stale || is.stale;

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-safe-t">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="pressable rounded-full bg-white p-2 shadow-soft">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">Sprints</h1>
          <p className="truncate text-sm text-cocoa-500">{issues.length ? `${issues.length} issues · ${agoLabel(ms.at)}` : `Hitos e issues de ${REPO}`}</p>
        </div>
      </header>

      <div className="scroll-area flex-1 px-4 pb-6">
        <p className="surface-1 rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
          Datos en vivo de GitHub (hitos e issues del repositorio del equipo). Se guardan 10 minutos en esta pestaña.
          {stale && <span className="block text-honey-600">Sin conexión con GitHub: mostrando la última lectura guardada.</span>}
        </p>

        {loading && (
          <div className="mt-4 space-y-3" aria-label="Cargando">
            <div className="skeleton h-40" />
            <div className="skeleton h-28" />
          </div>
        )}

        {!loading && error && (
          <EmptyState
            emoji={error === 'rate-limit' ? '⏳' : '📡'}
            title={error === 'rate-limit' ? 'GitHub pide esperar unos minutos' : 'No se pudo leer el repositorio'}
            body={
              error === 'rate-limit'
                ? 'Se alcanzó el límite de lecturas sin sesión (60 por hora). Vuelve a intentar en unos minutos o abre el tablero en GitHub.'
                : 'Esta pantalla necesita internet para leer los hitos e issues. La app sigue funcionando sin conexión.'
            }
            action={
              <div className="flex flex-col items-center gap-2">
                <Button icon={<RefreshCw size={18} />} onClick={() => location.reload()}>
                  Reintentar
                </Button>
                <a href={`${REPO_URL}/milestones`} target="_blank" rel="noreferrer" className="text-sm font-bold text-terra underline underline-offset-4">
                  Abrir hitos en GitHub
                </a>
              </div>
            }
          />
        )}

        {!loading && !error && (
          <div className="mt-4 space-y-4">
            {milestones.map((m) => (
              <MilestoneCard key={m.number} m={m} issues={issues.filter((i) => i.milestone?.number === m.number)} />
            ))}
            {!milestones.length && <EmptyState emoji="🗓️" title="Aún no hay hitos" body="Cuando el equipo cree los sprints en GitHub, aparecerán aquí." />}
            {unplanned.length > 0 && (
              <article className="surface-1 rounded-3xl p-4">
                <h2 className="text-lg font-bold">Sin hito</h2>
                <p className="text-xs text-cocoa-500">Issues que todavía no pertenecen a un sprint.</p>
                <ul className="mt-2">
                  {unplanned.map((i) => (
                    <IssueRow key={i.number} issue={i} />
                  ))}
                </ul>
              </article>
            )}
            <a href={PROJECTS_URL} target="_blank" rel="noreferrer" className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-3 text-sm font-bold text-cocoa-700 shadow-hairline hover:bg-white">
              Tablero del proyecto en GitHub <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
