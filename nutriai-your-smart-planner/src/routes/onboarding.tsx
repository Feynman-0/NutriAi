import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/nutri/Toast";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — NutriAI" }] }),
  component: Onboarding,
});

const GOALS = [
  { n: "01", name: "Lose Weight", desc: "Steady calorie deficit, high satiety meals." },
  { n: "02", name: "Build Muscle", desc: "Protein-led surplus engineered around your training." },
  { n: "03", name: "Maintain Weight", desc: "Hold your composition while eating well." },
  { n: "04", name: "Improve Energy", desc: "Balanced macros tuned for steady afternoon energy." },
];

function Onboarding() {
  const navigate = useNavigate();
  const { token, isReady, updateProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [height, setHeight] = useState("");
  const [heightSub, setHeightSub] = useState(false); // step 2 has 2 inputs
  const [goal, setGoal] = useState<string | null>(null);
  const [calories, setCalories] = useState("");

  useEffect(() => {
    if (isReady && !token) navigate({ to: "/login", replace: true });
  }, [isReady, token, navigate]);

  const bmr = useMemo(() => {
    const a = Number(age);
    const wKg = weightUnit === "kg" ? Number(weight) : Number(weight) * 0.4536;
    const hCm = Number(height);
    if (!a || !wKg || !hCm) return null;
    // Mifflin-St Jeor (assume male offset midpoint)
    return Math.round(10 * wKg + 6.25 * hCm - 5 * a + 5);
  }, [age, weight, weightUnit, height]);

  const targetSuggestion = useMemo(() => {
    if (!bmr) return null;
    if (goal === "Lose Weight") return Math.round(bmr * 1.25 - 500);
    if (goal === "Build Muscle") return Math.round(bmr * 1.45 + 300);
    return Math.round(bmr * 1.35);
  }, [bmr, goal]);

  useEffect(() => {
    if (targetSuggestion && !calories) setCalories(String(targetSuggestion));
  }, [targetSuggestion, calories]);

  const progress = (step / 4) * 100;
  const canNext =
    (step === 1 && Number(age) > 0) ||
    (step === 2 && !heightSub && Number(weight) > 0) ||
    (step === 2 && heightSub && Number(height) > 0) ||
    (step === 3 && goal) ||
    (step === 4 && Number(calories) > 0);

  async function finish() {
    try {
      await updateProfile({
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        goal: goal ?? "Lose Weight",
        dailyCalories: Number(calories),
      });
      toast("Profile saved");
      navigate({ to: "/generate" });
    } catch {
      toast("Could not save profile", "error");
    }
  }

  function next() {
    if (step === 2 && !heightSub) {
      setHeightSub(true);
      return;
    }
    if (step < 4) setStep(step + 1);
    else finish();
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Progress bar */}
      <div className="h-[2px] w-full bg-divider relative">
        <motion.div
          className="absolute left-0 top-0 h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between px-6 md:px-12 py-6">
        <p className="font-mono text-xs text-muted tracking-widest">
          STEP {step} OF 4
        </p>
        <p className="font-serif text-accent">NutriAI</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          key={`${step}-${heightSub}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-2xl"
        >
          {step === 1 && (
            <>
              <h2 className="font-serif italic text-3xl md:text-5xl text-text text-center">
                How old are you?
              </h2>
              <div className="mt-16">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="field-huge"
                  placeholder="28"
                  autoFocus
                />
                <p className="text-center text-muted mt-3 font-mono text-sm">years old</p>
              </div>
            </>
          )}

          {step === 2 && !heightSub && (
            <>
              <h2 className="font-serif italic text-3xl md:text-5xl text-text text-center">
                What's your current weight?
              </h2>
              <div className="mt-16">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="field-huge"
                  placeholder="72"
                  autoFocus
                />
                <div className="text-center mt-3 font-mono text-sm">
                  <button
                    onClick={() => setWeightUnit("kg")}
                    className={weightUnit === "kg" ? "text-accent" : "text-muted hover:text-text"}
                  >
                    kg
                  </button>
                  <span className="text-divider mx-2">/</span>
                  <button
                    onClick={() => setWeightUnit("lbs")}
                    className={weightUnit === "lbs" ? "text-accent" : "text-muted hover:text-text"}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && heightSub && (
            <>
              <h2 className="font-serif italic text-3xl md:text-5xl text-text text-center">
                What's your height?
              </h2>
              <div className="mt-16">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="field-huge"
                  placeholder="178"
                  autoFocus
                />
                <p className="text-center text-muted mt-3 font-mono text-sm">centimeters</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-serif italic text-3xl md:text-5xl text-text text-center mb-10">
                What do you want to achieve?
              </h2>
              <div className="flex flex-col">
                {GOALS.map((g) => {
                  const active = goal === g.name;
                  return (
                    <button
                      key={g.name}
                      onClick={() => setGoal(g.name)}
                      className={`relative text-left py-6 border-b border-divider flex items-baseline gap-6 transition-colors ${
                        active ? "text-text" : "text-muted hover:text-text"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[2px] bg-accent" />
                      )}
                      <span className={`font-mono text-sm ${active ? "text-accent" : "text-divider"}`}>
                        {g.n}
                      </span>
                      <span className="flex-1">
                        <span className="font-serif text-2xl block">{g.name}</span>
                        <span className="text-sm text-muted">{g.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-serif italic text-3xl md:text-5xl text-text text-center">
                What's your daily calorie target?
              </h2>
              <div className="mt-16">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="field-huge"
                  placeholder="1840"
                  autoFocus
                />
                <p className="text-center text-muted mt-3 font-mono text-sm">
                  kcal / day
                </p>
                {bmr && (
                  <p className="text-center text-muted mt-6 text-sm">
                    Estimated BMR{" "}
                    <span className="font-mono text-accent">{bmr}</span> kcal
                    {targetSuggestion && (
                      <>
                        {" "}· suggested target{" "}
                        <span className="font-mono text-accent">{targetSuggestion}</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="mt-16 flex items-center justify-between">
            <button
              onClick={() => {
                if (step === 2 && heightSub) setHeightSub(false);
                else if (step > 1) setStep(step - 1);
              }}
              disabled={step === 1}
              className="text-muted hover:text-text disabled:opacity-30 text-sm"
            >
              ← Back
            </button>
            {step < 4 ? (
              <button
                onClick={next}
                disabled={!canNext}
                className="link-accent disabled:opacity-30 text-lg"
              >
                Continue →
              </button>
            ) : (
              <button onClick={finish} disabled={!canNext} className="btn-primary !w-auto px-10">
                Generate My Plan →
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
