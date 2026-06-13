import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriAI — Eat with Intelligence" },
      {
        name: "description",
        content:
          "AI-crafted diet plans tailored to your body, goals and lifestyle. Start eating with intelligence.",
      },
      { property: "og:title", content: "NutriAI — Eat with Intelligence" },
      {
        property: "og:description",
        content: "AI-crafted diet plans, tailored to you.",
      },
    ],
  }),
  component: Landing,
});

const FOODS = [
  "Grilled Salmon",
  "Quinoa Bowl",
  "Avocado Toast",
  "Sweet Potato Hash",
  "Greek Yogurt",
  "Spinach Frittata",
  "Lentil Stew",
  "Chickpea Curry",
  "Roasted Carrots",
  "Tofu Stir-Fry",
  "Mango Smoothie",
  "Almond Butter Oats",
  "Wild Rice Pilaf",
  "Miso Cod",
  "Kale Caesar",
  "Beet Hummus",
];

function Ticker() {
  const list = [...FOODS, ...FOODS];
  return (
    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[30%] border-l border-divider overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 15%, transparent 85%, var(--bg) 100%)",
        }}
      />
      <div className="ticker flex flex-col gap-6 py-8 px-8">
        {list.map((f, i) => (
          <div key={i} className="font-mono text-sm text-muted whitespace-nowrap">
            {String(i + 1).padStart(2, "0")} · {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberedRow({
  number,
  title,
  body,
  reverse,
  art,
}: {
  number: string;
  title: string;
  body: string;
  reverse?: boolean;
  art: React.ReactNode;
}) {
  return (
    <section className="border-t border-divider">
      <div
        className={`max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-32 grid md:grid-cols-12 gap-10 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="md:col-span-7">
          <div className="font-serif text-[120px] md:text-[180px] leading-none text-divider select-none">
            {number}
          </div>
          <h3 className="font-serif text-4xl md:text-5xl text-text mt-4 italic">{title}</h3>
          <p className="text-muted mt-6 max-w-lg leading-relaxed">{body}</p>
        </div>
        <div className="md:col-span-5">{art}</div>
      </div>
    </section>
  );
}

function SilhouetteArt() {
  return (
    <svg viewBox="0 0 200 280" className="w-full max-w-[280px] mx-auto">
      <g stroke="var(--accent)" strokeWidth="1" fill="none">
        <circle cx="100" cy="40" r="22" />
        <path d="M100 62 L100 180" />
        <path d="M100 90 L60 140 M100 90 L140 140" />
        <path d="M100 180 L75 260 M100 180 L125 260" />
      </g>
      <g fill="var(--accent)">
        {[
          [60, 140],
          [140, 140],
          [100, 90],
          [100, 40],
          [75, 260],
          [125, 260],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" />
        ))}
      </g>
      <g stroke="var(--muted)" strokeWidth="0.5" strokeDasharray="2 3" fill="none">
        <path d="M60 140 L20 140 M140 140 L180 140 M100 40 L100 10 M100 90 L170 60" />
      </g>
      <g fill="var(--muted)" fontFamily="var(--font-mono)" fontSize="7">
        <text x="6" y="138">PROTEIN</text>
        <text x="150" y="138">FATS</text>
        <text x="80" y="8">BMR</text>
        <text x="125" y="60">CALORIES</text>
      </g>
    </svg>
  );
}

function BowlArt() {
  return (
    <svg viewBox="0 0 220 200" className="w-full max-w-[320px] mx-auto">
      <path d="M20 100 Q110 220 200 100" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <line x1="10" y1="100" x2="210" y2="100" stroke="var(--accent)" strokeWidth="1" />
      <g fill="var(--accent-warm)">
        <circle cx="70" cy="90" r="8" />
        <circle cx="105" cy="80" r="10" />
        <circle cx="140" cy="90" r="7" />
      </g>
      <g fill="var(--accent)" opacity="0.6">
        <circle cx="85" cy="95" r="4" />
        <circle cx="125" cy="92" r="4" />
      </g>
      <g stroke="var(--muted)" strokeWidth="0.4" fill="none" strokeDasharray="2 2">
        <path d="M70 90 L70 30 M140 90 L140 30 M105 80 L105 20" />
      </g>
      <g fill="var(--muted)" fontFamily="var(--font-mono)" fontSize="6">
        <text x="55" y="25">420 KCAL</text>
        <text x="125" y="25">32G PROTEIN</text>
      </g>
    </svg>
  );
}

function ChartArt() {
  return (
    <svg viewBox="0 0 260 180" className="w-full max-w-[320px] mx-auto">
      <g stroke="var(--divider)" strokeWidth="0.5">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="20" y1={y} x2="250" y2={y} />
        ))}
      </g>
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        points="20,140 60,120 100,90 140,100 180,70 220,55 250,40"
      />
      {[
        [20, 140],
        [60, 120],
        [100, 90],
        [140, 100],
        [180, 70],
        [220, 55],
        [250, 40],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)" />
      ))}
      <g fill="var(--muted)" fontFamily="var(--font-mono)" fontSize="7">
        <text x="20" y="175">MON</text>
        <text x="240" y="175">SUN</text>
      </g>
    </svg>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-bg text-text overflow-hidden">
      {/* Nav */}
      <header className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-accent" />
          <span className="font-serif text-lg text-accent">NutriAI</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/login" className="text-muted hover:text-text transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="link-accent">
            Get Started →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12 md:pt-24 pb-20 md:pb-32 relative">
          <p className="label-spaced mb-8">AI · Nutrition · 2026</p>
          <h1 className="font-serif italic font-bold leading-[0.95] text-balance"
              style={{ fontSize: "clamp(56px, 11vw, 180px)" }}>
            Eat with<br />
            <span className="text-accent">Intelligence.</span>
          </h1>
          <p className="mt-10 max-w-xl text-muted text-lg md:text-xl leading-relaxed">
            Personalized diet plans crafted by AI, tailored to your body, goals, and
            lifestyle.
          </p>
          <div className="mt-10 flex items-center gap-8">
            <Link to="/register" className="link-accent text-lg">
              Get Started →
            </Link>
            <Link to="/login" className="text-muted hover:text-text transition-colors">
              Sign In
            </Link>
          </div>
        </div>
        <Ticker />
      </section>

      {/* Stats strip */}
      <section className="border-t border-b border-divider">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 grid grid-cols-3 divide-x divide-divider">
          {[
            ["10,000+", "Plans Generated"],
            ["94%", "Goal Achievement"],
            ["AI", "Powered Engine"],
          ].map(([n, l], i) => (
            <div key={i} className={`${i === 0 ? "" : "pl-6"} pr-6`}>
              <div className="font-mono text-2xl md:text-3xl text-accent">{n}</div>
              <div className="label-spaced mt-2">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <NumberedRow
        number="01"
        title="Your body, your plan."
        body="We start with you — age, weight, height, activity. The model reasons about your maintenance calories, macro split and meal timing, then designs around the foods you actually eat."
        art={<SilhouetteArt />}
      />
      <NumberedRow
        number="02"
        title="Real food, calculated."
        body="No vague servings. Every meal is a specific dish with grams, calories and macros — engineered to land your daily target within a tight margin."
        reverse
        art={<BowlArt />}
      />
      <NumberedRow
        number="03"
        title="Progress you can read."
        body="Watch your week as a single chart. Streaks, averages and macro splits all surface inline — no dashboards, no fluff."
        art={<ChartArt />}
      />

      <footer className="border-t border-divider">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-wrap justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Leaf size={14} className="text-accent" />
            <span className="font-serif text-accent">NutriAI</span>
            <span className="ml-4">© 2026 — Eat with intelligence.</span>
          </div>
          <div className="font-mono text-xs">v1.0</div>
        </div>
      </footer>
    </div>
  );
}
