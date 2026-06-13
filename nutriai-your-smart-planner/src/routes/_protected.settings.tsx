import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/nutri/Toast";

export const Route = createFileRoute("/_protected/settings")({
  head: () => ({ meta: [{ title: "Settings — NutriAI" }] }),
  component: SettingsPage,
});

const GOALS = ["Lose Weight", "Build Muscle", "Maintain Weight", "Improve Energy"];
const DIETS = ["Omnivore", "Vegetarian", "Vegan", "Keto"];

function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [weight, setWeight] = useState(user?.weight ?? 70);
  const [height, setHeight] = useState(user?.height ?? 175);
  const [age, setAge] = useState(user?.age ?? 28);
  const [goal, setGoal] = useState(user?.goal ?? "Lose Weight");
  const [diet, setDiet] = useState(user?.dietaryPreference ?? "Omnivore");
  const [calories, setCalories] = useState(user?.dailyCalories ?? 1840);

  async function save() {
    await updateProfile({
      name,
      email,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      goal,
      dietaryPreference: diet,
      dailyCalories: Number(calories),
    });
    toast("Profile saved");
  }

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-[900px]">
      <p className="label-spaced">Settings</p>
      <h1 className="font-serif italic text-4xl md:text-5xl mt-3">Account Settings</h1>

      <Section label="Profile">
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <button onClick={save} className="link-accent mt-4 self-start">
          Save Changes →
        </button>
      </Section>

      <Section label="Body Metrics">
        <Field label="Weight (kg)" value={String(weight)} onChange={(v) => setWeight(Number(v) || 0)} type="number" />
        <Field label="Height (cm)" value={String(height)} onChange={(v) => setHeight(Number(v) || 0)} type="number" />
        <Field label="Age" value={String(age)} onChange={(v) => setAge(Number(v) || 0)} type="number" />
        <div className="mt-2">
          <p className="label-spaced mb-2">Goal</p>
          <div className="flex flex-col">
            {GOALS.map((g, i) => {
              const active = goal === g;
              return (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`relative text-left py-3 border-b border-divider flex items-baseline gap-4 ${
                    active ? "text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-accent" />
                  )}
                  <span className={`font-mono text-xs ${active ? "text-accent" : "text-divider"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-lg">{g}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section label="Preferences">
        <div>
          <p className="label-spaced mb-2">Dietary preference</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {DIETS.map((d) => {
              const active = diet === d;
              return (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  className={`font-serif text-lg pb-1 border-b ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <Field
          label="Daily calorie target"
          value={String(calories)}
          onChange={(v) => setCalories(Number(v) || 0)}
          type="number"
        />
      </Section>

      <Section label="Account">
        <button className="text-left text-text hover:text-accent transition-colors py-2 border-b border-divider">
          Change Password →
        </button>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="text-left text-muted hover:text-accent transition-colors py-2 border-b border-divider"
        >
          Sign out →
        </button>
        <button
          className="text-left py-2 border-b border-divider"
          style={{ color: "var(--danger)", opacity: 0.8 }}
        >
          Delete Account →
        </button>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 border-t border-divider pt-8">
      <p className="label-spaced mb-6">{label}</p>
      <div className="flex flex-col gap-6 max-w-md">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label-spaced block mb-2">{label}</label>
      <input
        className="field"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
