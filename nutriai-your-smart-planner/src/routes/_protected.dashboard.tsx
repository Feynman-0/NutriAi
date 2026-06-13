import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDiet } from "@/contexts/DietContext";

export const Route = createFileRoute("/_protected/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NutriAI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { currentPlan, fetchPlan } = useDiet();

  useEffect(() => {
    if (user && !currentPlan) fetchPlan(user.id);
  }, [user, currentPlan, fetchPlan]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const day = currentPlan?.days[3] ?? currentPlan?.days[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-[1200px]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:items-end sm:justify-between border-b border-divider pb-8">
        <h1 className="font-serif italic text-4xl md:text-5xl truncate">
          {greeting()}, {user?.name?.split(" ")[0] ?? "friend"}.
        </h1>
        <p className="font-mono text-xs md:text-sm text-muted shrink-0">{today}</p>
      </header>

      {/* Summary strip */}
      <section className="mt-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-divider border-b border-divider">
        {[
          [`${user?.dailyCalories ?? 1840} kcal`, "Today's Target"],
          ["3 Meals", "Planned today"],
          ["Day 4 of 7", "Plan progress"],
          [user?.goal ?? "Lose Weight", "Current goal"],
        ].map(([v, l], i) => (
          <div key={i} className={`py-6 ${i === 0 ? "" : "pl-6"} pr-6`}>
            <div className="font-mono text-xl md:text-2xl text-accent">{v}</div>
            <div className="label-spaced mt-2">{l}</div>
          </div>
        ))}
      </section>

      {/* Today's meals */}
      <section className="mt-14">
        <p className="label-spaced">Today's Meals</p>
        <div className="mt-6 flex flex-col">
          {day ? (
            day.meals.map((m, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 md:gap-6 items-baseline py-5 border-b border-divider"
              >
                <div>
                  <div className="font-serif text-2xl">{m.name}</div>
                  <div className="text-xs text-muted font-mono mt-1">{m.time}</div>
                </div>
                <div className="text-sm text-muted leading-relaxed">
                  {m.items.join(" · ")}
                </div>
                <div className="font-mono text-accent text-right md:text-base text-sm">
                  {m.kcal} kcal
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-full shimmer" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI tip */}
      <section className="mt-16 border-l-2 border-accent pl-6 py-2 max-w-3xl">
        <p className="font-serif italic text-xl md:text-2xl text-text leading-relaxed">
          "You hit your protein target three days running. Keep the morning yogurt habit —
          it's anchoring the rest of your day."
        </p>
        <p className="mt-4 text-sm text-muted font-mono">— NutriAI</p>
      </section>
    </div>
  );
}
