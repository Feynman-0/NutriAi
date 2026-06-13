import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useDiet } from "@/contexts/DietContext";
import { useAuth } from "@/contexts/AuthContext";
import { exportPlanToPDF } from "@/utils/exportPlan";

export const Route = createFileRoute("/_protected/plan")({
  head: () => ({ meta: [{ title: "Your Plan — NutriAI" }] }),
  component: PlanPage,
});

function PlanPage() {
  const { currentPlan, fetchPlan } = useDiet();
  const { user } = useAuth();
  const [day, setDay] = useState(1);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!currentPlan) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 50)); // let spinner render
    exportPlanToPDF(currentPlan, user?.name ?? "NutriAI User");
    setExporting(false);
  }

  useEffect(() => {
    if (user && !currentPlan) fetchPlan(user.id);
  }, [user, currentPlan, fetchPlan]);

  if (!currentPlan) {
    return (
      <div className="px-6 md:px-12 py-20 max-w-[1100px] min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg viewBox="0 0 120 120" className="mx-auto w-32 h-32 mb-8">
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--divider)" />
            <path
              d="M40 60 Q60 30 80 60 Q60 90 40 60"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="60" r="3" fill="var(--accent)" />
          </svg>
          <p className="font-serif italic text-2xl text-text">No plan yet.</p>
          <Link to="/generate" className="link-accent mt-6 inline-block">
            Generate your first plan →
          </Link>
        </div>
      </div>
    );
  }

  const selected = currentPlan.days.find((d) => d.day === day) ?? currentPlan.days[0];
  const totals = selected.meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-[1100px]">
      <header className="border-b border-divider pb-6 flex items-start justify-between gap-4">
        <div>
          <p className="label-spaced">Diet Plan</p>
          <h1 className="font-serif italic text-4xl md:text-5xl mt-3">Your 7-Day Plan</h1>
          <div className="flex items-center gap-3 mt-3">
            <p className="font-mono text-xs text-muted">
              Generated {new Date(currentPlan.generatedAt).toLocaleDateString()}
            </p>
            {(currentPlan as { isCurated?: boolean }).isCurated && (
              <span className="font-mono text-[10px] border border-divider text-muted px-2 py-0.5">
                CURATED PLAN · AI UNAVAILABLE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 border border-divider hover:border-accent text-muted hover:text-accent font-mono text-xs px-4 py-2 transition-colors mt-2 shrink-0 disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
      </header>

      {/* Day selector */}
      <div className="mt-8 flex gap-6 overflow-x-auto pb-1 -mx-6 px-6 md:mx-0 md:px-0">
        {currentPlan.days.map((d) => {
          const active = d.day === day;
          return (
            <button
              key={d.day}
              onClick={() => setDay(d.day)}
              className={`font-mono text-sm pb-2 whitespace-nowrap border-b transition-colors ${
                active
                  ? "text-accent border-accent"
                  : "text-muted border-transparent hover:text-text"
              }`}
            >
              Day {d.day}
            </button>
          );
        })}
      </div>

      {/* Meals */}
      <section className="mt-10">
        {selected.meals.map((m, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 py-8 border-b border-divider"
          >
            <div>
              <div className="font-serif text-3xl">{m.name}</div>
              <div className="font-mono text-xs text-muted mt-1">{m.time}</div>
              <ul className="mt-5 space-y-2">
                {m.items.map((it, j) => (
                  <li key={j} className="text-text">
                    <span className="text-muted mr-2">—</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            <div className="font-mono text-sm text-right md:min-w-[140px] text-muted space-y-1 self-start">
              <div className="text-accent text-base">{m.kcal} kcal</div>
              <div>{m.protein}g protein</div>
              <div>{m.carbs}g carbs</div>
              <div>{m.fat}g fat</div>
            </div>
          </div>
        ))}
      </section>

      {/* Notes */}
      <section className="mt-12 border-l-2 border-accent pl-6 py-2 max-w-3xl">
        <p className="label-spaced mb-3">Nutritionist Notes</p>
        <p className="font-serif italic text-lg md:text-xl leading-relaxed">{selected.notes}</p>
      </section>

      {/* Totals strip */}
      <section className="mt-14 grid grid-cols-2 md:grid-cols-4 divide-x divide-divider border-y border-divider">
        {[
          [`${totals.kcal} kcal`, "Total"],
          [`${totals.protein}g`, "Protein"],
          [`${totals.carbs}g`, "Carbs"],
          [`${totals.fat}g`, "Fat"],
        ].map(([v, l], i) => (
          <div key={i} className={`py-6 ${i === 0 ? "" : "pl-6"} pr-6`}>
            <div className="font-mono text-xl text-accent">{v}</div>
            <div className="label-spaced mt-2">{l}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
