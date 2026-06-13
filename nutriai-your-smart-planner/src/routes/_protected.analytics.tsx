import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useDiet } from "@/contexts/DietContext";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_protected/analytics")({
  head: () => ({ meta: [{ title: "Analytics — NutriAI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { analytics, fetchAnalytics } = useDiet();

  useEffect(() => {
    if (user && !analytics) fetchAnalytics(user.id);
  }, [user, analytics, fetchAnalytics]);

  if (!analytics) {
    return (
      <div className="px-6 md:px-12 py-14 max-w-[1100px] space-y-4">
        <div className="h-12 w-2/3 shimmer" />
        <div className="h-72 w-full shimmer" />
      </div>
    );
  }

  const total = analytics.macros.protein * 4 + analytics.macros.carbs * 4 + analytics.macros.fat * 9;
  const pProtein = (analytics.macros.protein * 4) / total;
  const pCarbs = (analytics.macros.carbs * 4) / total;
  const pFat = (analytics.macros.fat * 9) / total;

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-[1100px]">
      <p className="label-spaced">Analytics</p>
      <h1 className="font-serif italic text-4xl md:text-5xl mt-3">Your Progress</h1>

      {/* Calorie chart */}
      <section className="mt-14">
        <p className="label-spaced mb-6">Calorie tracking · 7 days</p>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={analytics.daily} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1e2b20" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#7a8c7d"
                tick={{ fill: "#7a8c7d", fontFamily: "Space Mono", fontSize: 11 }}
                axisLine={{ stroke: "#1e2b20" }}
                tickLine={false}
              />
              <YAxis
                stroke="#7a8c7d"
                tick={{ fill: "#7a8c7d", fontFamily: "Space Mono", fontSize: 11 }}
                axisLine={{ stroke: "#1e2b20" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111812",
                  border: "1px solid #1e2b20",
                  fontFamily: "Space Mono",
                  color: "#f0ede6",
                }}
                cursor={{ stroke: "#4ade80", strokeDasharray: "2 4" }}
              />
              <Line
                type="monotone"
                dataKey="kcal"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ r: 4, fill: "#4ade80", stroke: "#4ade80" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Macro stacked bar */}
      <section className="mt-16">
        <p className="label-spaced mb-6">Macro breakdown</p>
        <div className="flex w-full h-8 overflow-hidden">
          <div style={{ width: `${pProtein * 100}%`, background: "#4ade80" }} />
          <div style={{ width: `${pCarbs * 100}%`, background: "#d4a853" }} />
          <div style={{ width: `${pFat * 100}%`, background: "#7a8c7d" }} />
        </div>
        <div className="grid grid-cols-3 mt-6 gap-6">
          {[
            ["Protein", analytics.macros.protein, pProtein, "#4ade80"],
            ["Carbs", analytics.macros.carbs, pCarbs, "#d4a853"],
            ["Fat", analytics.macros.fat, pFat, "#7a8c7d"],
          ].map(([name, g, p, c], i) => (
            <div key={i}>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2" style={{ background: c as string }} />
                <span className="label-spaced">{name as string}</span>
              </div>
              <div className="font-mono text-2xl text-text mt-2">{g as number}g</div>
              <div className="font-mono text-xs text-muted mt-1">
                {((p as number) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Goal progress */}
      <section className="mt-16">
        <p className="label-spaced mb-6">Goal progress</p>
        <div className="flex items-center gap-3">
          {analytics.completedDays.map((c, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-full border ${
                c ? "bg-accent border-accent" : "border-muted"
              }`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          <span className="font-mono text-accent">
            {analytics.completedDays.filter(Boolean).length}
          </span>{" "}
          of 7 days on track
        </p>
      </section>

      {/* Summary */}
      <section className="mt-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-divider border-y border-divider">
        {[
          [`${analytics.summary.avgCalories}`, "Avg daily kcal"],
          [analytics.summary.bestDay, "Best day"],
          [`${analytics.summary.streak} days`, "Current streak"],
          [`${analytics.summary.plansGenerated}`, "Plans generated"],
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
