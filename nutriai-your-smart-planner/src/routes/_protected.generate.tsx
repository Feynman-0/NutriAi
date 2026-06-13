import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDiet } from "@/contexts/DietContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/nutri/Toast";

export const Route = createFileRoute("/_protected/generate")({
  head: () => ({ meta: [{ title: "Generate Plan — NutriAI" }] }),
  component: GeneratePage,
});

const GOALS = ["Lose Weight", "Build Muscle", "Maintain Weight", "Improve Energy"];
const DIETS = ["Omnivore", "Vegetarian", "Vegan", "Keto"];
const ALLERGIES = ["Nuts", "Dairy", "Gluten", "Shellfish"];

const LOADING_MESSAGES = [
  "Analyzing your profile…",
  "Calculating macros…",
  "Crafting your meals…",
  "Finalizing recommendations…",
];

function GeneratePage() {
  const { user } = useAuth();
  const { generatePlan, isGenerating } = useDiet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : "");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [goal, setGoal] = useState(user?.goal ?? "Lose Weight");
  const [diet, setDiet] = useState(user?.dietaryPreference ?? "Omnivore");
  const [meals, setMeals] = useState(3);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 900);
    return () => clearInterval(id);
  }, [isGenerating]);

  function toggleAllergy(a: string) {
    setAllergies((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  async function onGenerate() {
    if (!weight) {
      toast("Enter your weight", "error");
      return;
    }
    await generatePlan({ weight, weightUnit, goal, diet, meals, allergies });
    toast("Your plan is ready");
    navigate({ to: "/plan" });
  }

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-[1000px]">
      <p className="label-spaced">Generate</p>
      <h1 className="font-serif italic text-4xl md:text-6xl mt-3">Generate Your Plan</h1>
      <p className="text-muted mt-4 max-w-xl">
        Your AI-powered meal plan, ready in seconds.
      </p>

      <div className="mt-14 flex flex-col gap-12">
        {/* weight */}
        <div>
          <p className="label-spaced mb-3">Current weight</p>
          <div className="flex items-center border-b border-divider focus-within:border-accent">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="field !border-0 !pb-3 !pt-2 text-2xl font-mono text-accent"
              placeholder="72"
            />
            <div className="ml-3 font-mono text-sm">
              <button
                onClick={() => setWeightUnit("kg")}
                className={weightUnit === "kg" ? "text-accent" : "text-muted"}
              >
                kg
              </button>
              <span className="text-divider mx-2">/</span>
              <button
                onClick={() => setWeightUnit("lbs")}
                className={weightUnit === "lbs" ? "text-accent" : "text-muted"}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* goal */}
        <div>
          <p className="label-spaced mb-3">Goal</p>
          <div className="flex flex-col">
            {GOALS.map((g, i) => {
              const active = goal === g;
              return (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`relative text-left py-4 border-b border-divider flex items-baseline gap-5 ${
                    active ? "text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[2px] bg-accent" />
                  )}
                  <span className={`font-mono text-xs ${active ? "text-accent" : "text-divider"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-xl">{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* diet */}
        <div>
          <p className="label-spaced mb-3">Dietary preference</p>
          <div className="flex flex-col">
            {DIETS.map((d) => {
              const active = diet === d;
              return (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  className={`relative text-left py-4 border-b border-divider ${
                    active ? "text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[2px] bg-accent" />
                  )}
                  <span className="pl-5 font-serif text-xl">{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* meals per day */}
        <div>
          <p className="label-spaced mb-3">Meals per day</p>
          <div className="flex items-center gap-8 mt-2">
            <button
              onClick={() => setMeals(Math.max(2, meals - 1))}
              className="text-muted hover:text-accent text-2xl font-mono"
            >
              −
            </button>
            <span className="font-mono text-5xl text-accent w-20 text-center">{meals}</span>
            <button
              onClick={() => setMeals(Math.min(6, meals + 1))}
              className="text-muted hover:text-accent text-2xl font-mono"
            >
              +
            </button>
          </div>
        </div>

        {/* allergies */}
        <div>
          <p className="label-spaced mb-3">Any allergies?</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-3">
            {ALLERGIES.map((a) => {
              const active = allergies.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAllergy(a)}
                  className={`font-mono text-sm pb-1 border-b ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onGenerate}
          className="btn-primary"
          style={{ height: 60 }}
        >
          Generate My 7-Day Plan →
        </button>
      </div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-bg flex items-center justify-center"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-divider">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
              />
            </div>
            <div className="text-center px-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="font-serif italic text-3xl md:text-4xl text-text"
                >
                  {LOADING_MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-6 font-mono text-xs text-muted tracking-widest">NUTRIAI · GENERATING</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
