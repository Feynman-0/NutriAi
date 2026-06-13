import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Goal-aware curated plans ────────────────────────────────────────────────
// Each goal has 7 days. Macros (p/c/f) are per-meal [breakfast, lunch, snack, dinner].
const PLANS = {
  "Lose Weight": [
    { b: ["Greek yogurt with berries", "Rolled oats", "Green tea"],          l: ["Grilled chicken breast", "Quinoa with vegetables", "Cucumber salad"],    s: ["Almonds (20g)", "Apple"],              d: ["Baked salmon", "Sweet potato mash", "Steamed broccoli"],         note: "Aim for 2.5L of water. Spacing meals evenly controls hunger.", p:[24,44,5,42], c:[48,52,24,38], f:[9,12,10,14], r:[0.22,0.32,0.12,0.34] },
    { b: ["Scrambled eggs with spinach", "Whole wheat toast", "Black coffee"],l: ["Grilled chicken salad", "Olive oil dressing", "Whole grain crackers"],   s: ["Low-fat cottage cheese", "Cucumber"], d: ["Baked cod fillet", "Cauliflower mash", "Roasted carrots"],        note: "High protein breakfast suppresses appetite for the full day.", p:[28,38,14,36], c:[30,44,8,22], f:[14,10,4,10], r:[0.22,0.32,0.12,0.34] },
    { b: ["Avocado toast on sourdough", "Boiled eggs (x2)", "Lemon water"],  l: ["Lamb kofta with bulgur wheat", "Tomato herb salad"],                     s: ["Mixed nuts (25g)", "Orange"],         d: ["Pan-seared tilapia", "Brown rice", "Sautéed green beans"],       note: "Avocado fats keep you full — skip the mid-morning munchies.", p:[20,36,7,38], c:[42,55,20,44], f:[18,14,12,10], r:[0.22,0.32,0.12,0.34] },
    { b: ["Overnight oats with chia", "Sliced banana", "Herbal tea"],        l: ["Chicken and vegetable stir-fry", "Brown rice"],                          s: ["Low-fat yogurt", "Berries"],          d: ["Baked chicken breast", "Lentil soup", "Whole wheat bread"],      note: "Eat complex carbs at lunch — they metabolise slower than dinner.", p:[18,42,10,46], c:[52,44,18,50], f:[8,10,4,9], r:[0.22,0.32,0.12,0.34] },
    { b: ["Smoothie (banana, spinach, almond milk)", "Chia seeds"],          l: ["Grilled beef patty (lettuce wrap)", "Mixed salad"],                      s: ["Dates (3)", "Almonds"],               d: ["Prawn stir-fry", "Edamame", "Jasmine rice (small)"],             note: "Keep dinner light — your body needs less fuel in the evening.", p:[14,40,6,36], c:[58,28,20,36], f:[12,16,4,8], r:[0.22,0.32,0.12,0.34] },
    { b: ["Poached eggs on rye bread", "Green smoothie"],                    l: ["Chicken shawarma wrap (no sauce)", "Pickled vegetables"],               s: ["Plain yogurt", "Mixed seeds"],        d: ["Slow-cooked chicken stew", "Side salad"],                        note: "Weekend — meal prep now saves calories and money all week.", p:[26,38,12,42], c:[36,52,14,30], f:[16,14,6,16], r:[0.22,0.32,0.12,0.34] },
    { b: ["Oat pancakes", "Fresh fruit bowl", "Black coffee"],               l: ["Grilled lamb chops", "Tabbouleh", "Mint yogurt"],                       s: ["Rice cakes (x2)", "Peanut butter"],   d: ["Baked chicken with herbs", "Roasted asparagus"],                 note: "End the week strong. Reflect on your progress — you earned it.", p:[16,44,8,46], c:[62,38,24,32], f:[10,20,8,12], r:[0.22,0.32,0.12,0.34] },
  ],
  "Build Muscle": [
    { b: ["5 egg omelette with cheese", "Whole wheat toast (x2)", "Milk"],   l: ["Beef stir-fry with brown rice", "Steamed broccoli"],                     s: ["Protein-rich yogurt", "Banana"],      d: ["Grilled chicken thighs", "Mashed potatoes", "Roasted carrots"],  note: "Eat within 30 mins of waking — muscle protein synthesis peaks.", p:[42,52,20,56], c:[30,60,42,48], f:[22,14,6,18], r:[0.20,0.35,0.15,0.30] },
    { b: ["Oats with whole milk", "2 boiled eggs", "Peanut butter toast"],   l: ["Lamb mince with pasta", "Tomato sauce"],                                 s: ["Cottage cheese (200g)", "Walnuts"],   d: ["Baked salmon", "Brown rice", "Steamed spinach"],                 note: "Carbs around training replenish glycogen — eat more at lunch.", p:[38,48,24,52], c:[55,65,10,50], f:[18,18,14,16], r:[0.20,0.35,0.15,0.30] },
    { b: ["Greek yogurt parfait", "Granola", "Mixed berries", "Milk"],       l: ["Grilled chicken breast", "Quinoa", "Roasted peppers"],                  s: ["Hard-boiled eggs (x2)", "Almonds"],   d: ["Beef kebab", "Bulgur wheat", "Mixed salad"],                     note: "Rest day? Drop carbs slightly but keep protein high.", p:[32,58,24,54], c:[45,58,8,44], f:[12,14,10,16], r:[0.20,0.35,0.15,0.30] },
    { b: ["Protein smoothie (milk, banana, oats, peanut butter)"],           l: ["Chicken and rice bowl", "Black beans", "Avocado"],                      s: ["Cheese slices", "Whole wheat crackers"],d:["Grilled lamb chops", "Sweet potato", "Green beans"],             note: "Calorie surplus is essential — don't skip meals on training days.", p:[44,56,20,58], c:[62,70,18,52], f:[16,12,10,18], r:[0.20,0.35,0.15,0.30] },
    { b: ["French toast (x3)", "Honey", "Scrambled eggs"],                   l: ["Beef burger patty", "Whole wheat bun", "Lettuce", "Tomato"],            s: ["Mixed nuts (50g)", "Dates (4)"],      d: ["Chicken thighs with pasta", "Tomato sauce"],                     note: "Pre-workout meal 2hrs before training — complex carbs + protein.", p:[36,50,18,56], c:[58,52,24,65], f:[20,16,20,14], r:[0.20,0.35,0.15,0.30] },
    { b: ["Omelette (4 eggs)", "Grilled mushrooms", "Whole grain toast"],    l: ["Grilled salmon", "Brown rice", "Edamame"],                              s: ["Banana", "Peanut butter"],            d: ["Slow-cooked beef", "Roasted potatoes", "Roasted vegetables"],   note: "Sleep is where muscle is built — aim for 8hrs tonight.", p:[40,54,16,60], c:[32,58,36,52], f:[24,16,8,20], r:[0.20,0.35,0.15,0.30] },
    { b: ["Pancakes with honey", "Eggs (x3)", "Orange juice"],               l: ["Chicken shawarma", "Hummus", "Pita bread"],                             s: ["Greek yogurt", "Granola"],            d: ["Grilled beef steak", "Mashed potatoes", "Asparagus"],           note: "High protein day to cap the week. Track your lifts — progress is your proof.", p:[34,52,22,62], c:[68,45,28,40], f:[14,18,6,22], r:[0.20,0.35,0.15,0.30] },
  ],
  "Maintain Weight": [
    { b: ["Greek yogurt", "Granola", "Blueberries"],                         l: ["Grilled chicken wrap", "Hummus", "Salad"],                              s: ["Apple", "Almonds (20g)"],             d: ["Baked salmon", "Brown rice", "Broccoli"],                        note: "Maintenance is about consistency — same time, same portions.", p:[20,38,6,34], c:[48,45,24,42], f:[8,12,8,14], r:[0.25,0.30,0.15,0.30] },
    { b: ["Avocado and eggs on toast", "Coffee"],                            l: ["Beef and vegetable soup", "Whole grain bread"],                         s: ["Banana", "Peanut butter"],            d: ["Grilled chicken", "Quinoa", "Mixed greens"],                     note: "Balanced macros across all meals — no big spikes or crashes.", p:[24,32,8,38], c:[36,50,30,44], f:[18,12,8,10], r:[0.25,0.30,0.15,0.30] },
    { b: ["Porridge with honey", "Mixed seeds", "Green tea"],                l: ["Tuna salad (canned)", "Whole grain crackers", "Cherry tomatoes"],       s: ["Cottage cheese", "Cucumber"],         d: ["Lamb kofta", "Brown rice", "Roasted vegetables"],                note: "Tuna is one of the most calorie-efficient proteins available.", p:[16,40,14,40], c:[52,36,8,48], f:[6,10,4,16], r:[0.25,0.30,0.15,0.30] },
    { b: ["Smoothie bowl (oats, fruits, nuts)"],                             l: ["Grilled chicken salad", "Feta", "Olive oil"],                           s: ["Rice cakes", "Almond butter"],        d: ["Baked cod", "Sweet potato", "Steamed peas"],                     note: "Eating slowly is a proven maintenance tool — your satiety signals lag.", p:[18,36,6,36], c:[58,30,28,46], f:[10,14,8,10], r:[0.25,0.30,0.15,0.30] },
    { b: ["Eggs Benedict (no hollandaise)", "Whole wheat muffin"],           l: ["Chicken shawarma bowl", "Bulgur", "Tzatziki"],                          s: ["Mixed nuts", "Dried cranberries"],    d: ["Prawn stir-fry", "Jasmine rice", "Pak choi"],                    note: "Midweek check-in — are you eating when hungry, not just bored?", p:[26,40,8,38], c:[30,52,22,44], f:[14,16,12,8], r:[0.25,0.30,0.15,0.30] },
    { b: ["Fruit and nut muesli", "Almond milk"],                            l: ["Lamb kebab", "Pita", "Salad", "Yogurt dip"],                            s: ["Greek yogurt", "Honey"],              d: ["Beef stew", "Mashed potato", "Green beans"],                     note: "Social eating is fine — just be mindful of portions.", p:[18,44,14,42], c:[55,48,18,38], f:[10,18,4,16], r:[0.25,0.30,0.15,0.30] },
    { b: ["Pancakes with fresh fruit", "Coffee"],                            l: ["Grilled salmon", "Roasted vegetables", "Couscous"],                     s: ["Dates", "Walnuts"],                   d: ["Chicken thighs with herbs", "Roasted potatoes", "Salad"],        note: "A balanced week means balance on weekends too — enjoy your meals.", p:[16,40,8,40], c:[60,44,24,42], f:[10,14,6,14], r:[0.25,0.30,0.15,0.30] },
  ],
  "Improve Energy": [
    { b: ["Oats with banana and honey", "Walnuts", "Green tea"],             l: ["Brown rice with chicken", "Spinach and lemon dressing"],                s: ["Dates (3)", "Almond milk"],           d: ["Grilled tilapia", "Sweet potato", "Steamed greens"],             note: "Complex carbs fuel steady energy — avoid sugary breakfast cereals.", p:[18,38,4,34], c:[62,58,30,48], f:[8,10,2,10], r:[0.25,0.30,0.15,0.30] },
    { b: ["Smoothie (spinach, banana, oats, milk)", "Flaxseeds"],            l: ["Chicken and quinoa salad", "Lemon olive oil dressing"],                 s: ["Mixed fruit bowl", "Yogurt"],         d: ["Baked salmon", "Brown rice", "Roasted asparagus"],               note: "Iron from leafy greens fights fatigue — add lemon to absorb more.", p:[14,40,8,38], c:[65,50,35,44], f:[8,10,2,14], r:[0.25,0.30,0.15,0.30] },
    { b: ["Avocado on whole grain toast", "Boiled eggs"],                    l: ["Beef and lentil soup", "Whole grain bread"],                            s: ["Apple", "Peanut butter"],             d: ["Grilled chicken", "Mashed sweet potato", "Broccoli"],            note: "Lentils are iron-packed energy food — great midweek fuel.", p:[20,36,6,38], c:[40,55,30,45], f:[18,12,8,10], r:[0.25,0.30,0.15,0.30] },
    { b: ["Berry overnight oats", "Chia seeds", "Almond milk"],             l: ["Grilled lamb wrap", "Hummus", "Rocket leaves"],                        s: ["Banana", "Walnuts"],                  d: ["Prawn and vegetable stir-fry", "Brown rice"],                    note: "Omega-3 in fish and walnuts reduces brain fog — notice the difference.", p:[16,38,6,36], c:[60,48,28,50], f:[8,14,10,8], r:[0.25,0.30,0.15,0.30] },
    { b: ["Egg and vegetable omelette", "Whole wheat toast"],                l: ["Chicken and chickpea stew", "Pita bread"],                             s: ["Trail mix (nuts, seeds, raisins)"],    d: ["Baked cod", "Roasted potatoes", "Green salad"],                  note: "Chickpeas release energy slowly — perfect midday fuel.", p:[28,42,10,34], c:[32,52,30,48], f:[14,10,12,8], r:[0.25,0.30,0.15,0.30] },
    { b: ["Granola with yogurt", "Mixed berries", "Coffee"],                 l: ["Chicken shawarma bowl", "Tabbouleh"],                                   s: ["Orange", "Pumpkin seeds"],            d: ["Grilled beef skewers", "Bulgur wheat", "Cucumber salad"],        note: "Magnesium from seeds improves sleep quality and morning energy.", p:[16,40,8,44], c:[52,46,18,42], f:[10,14,4,16], r:[0.25,0.30,0.15,0.30] },
    { b: ["Banana pancakes (banana + eggs)", "Honey"],                       l: ["Salmon and avocado salad", "Lemon dressing", "Quinoa"],                s: ["Dates (4)", "Cashews"],               d: ["Lamb stew with vegetables", "Brown rice"],                       note: "Finish strong. Reflect on your energy levels this week — notice patterns.", p:[20,42,8,40], c:[58,40,28,48], f:[10,16,10,18], r:[0.25,0.30,0.15,0.30] },
  ],
};

function buildFallbackPlan(calories, goal, diet) {
  const target = calories || 1800;
  const goalKey = Object.keys(PLANS).find((k) => k === goal) || "Lose Weight";
  const days = PLANS[goalKey];

  return {
    generatedAt: new Date().toISOString(),
    isCurated: true,   // flag so frontend can show a subtle notice
    days: days.map((d, i) => ({
      day: i + 1,
      meals: [
        { name: "Breakfast", time: "8:00 AM",  items: d.b, kcal: Math.round(target * d.r[0]), protein: d.p[0], carbs: d.c[0], fat: d.f[0] },
        { name: "Lunch",     time: "1:00 PM",  items: d.l, kcal: Math.round(target * d.r[1]), protein: d.p[1], carbs: d.c[1], fat: d.f[1] },
        { name: "Snack",     time: "4:30 PM",  items: d.s, kcal: Math.round(target * d.r[2]), protein: d.p[2], carbs: d.c[2], fat: d.f[2] },
        { name: "Dinner",    time: "7:30 PM",  items: d.d, kcal: target - Math.round(target * d.r[0]) - Math.round(target * d.r[1]) - Math.round(target * d.r[2]), protein: d.p[3], carbs: d.c[3], fat: d.f[3] },
      ],
      notes: d.note,
    })),
  };
}

export async function generateDietPlan({
  weight,
  weightUnit,
  goal,
  diet,
  meals,
  allergies,
  dailyCalories,
}) {
  const weightKg =
    weightUnit === "lbs" ? (Number(weight) * 0.453592).toFixed(1) : Number(weight);
  const target = dailyCalories || 1800;
  const allergyText =
    allergies && allergies.length > 0
      ? `Must strictly avoid: ${allergies.join(", ")}.`
      : "No specific allergies.";

  const mealSchedules = {
    2: "Breakfast (8 AM), Dinner (7 PM)",
    3: "Breakfast (8 AM), Lunch (1 PM), Dinner (7 PM)",
    4: "Breakfast (8 AM), Lunch (1 PM), Snack (4:30 PM), Dinner (7:30 PM)",
    5: "Breakfast (8 AM), Morning Snack (10:30 AM), Lunch (1 PM), Afternoon Snack (4 PM), Dinner (7 PM)",
    6: "Breakfast (7:30 AM), Morning Snack (10 AM), Lunch (12:30 PM), Afternoon Snack (3:30 PM), Dinner (6:30 PM), Evening Snack (9 PM)",
  };
  const schedule = mealSchedules[meals] || mealSchedules[3];

  const prompt = `You are a certified nutritionist and dietitian. Create a complete, varied 7-day personalized diet plan.

Client profile:
- Goal: ${goal}
- Weight: ${weightKg}kg
- Dietary style: ${diet}
- Meals per day: ${meals} (${schedule})
- Daily calorie target: ${target} kcal
- ${allergyText}

Rules:
- Each day must be different — vary the meals, never repeat the same day.
- All food items must be real, specific, and properly portioned.
- Daily kcal totals must sum to within ±100 of ${target}.
- Protein, carbs and fat values must be realistic for the food items listed.
- Keep the dietary style (${diet}) strictly throughout.
- Use only chicken, beef, lamb, turkey, or fish as protein sources. Never include pork, bacon, ham, lard, or alcohol-based ingredients.

Return ONLY a valid JSON object, no markdown fences, no extra text:
{
  "generatedAt": "${new Date().toISOString()}",
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Breakfast",
          "time": "8:00 AM",
          "items": ["specific food item 1", "specific food item 2"],
          "kcal": 420,
          "protein": 28,
          "carbs": 52,
          "fat": 10
        }
      ],
      "notes": "one practical nutritionist tip for this specific day"
    }
  ]
}`;

  // Try models in order until one works — 20s timeout per model so we fail fast
  const MODELS = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ];

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 3500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nutriai.app",
            "X-Title": "NutriAI Diet Planner",
          },
          timeout: 20000,
        },
      );

      const raw = response.data.choices[0]?.message?.content?.trim() || "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");

      const parsed = JSON.parse(match[0]);
      if (!parsed.days || !Array.isArray(parsed.days)) throw new Error("Invalid plan structure");

      console.log(`Plan generated successfully with ${model}`);
      return { ...parsed, isCurated: false };
    } catch (err) {
      console.error(`Model ${model} failed: ${err.message}`);
      // continue to next model
    }
  }

  console.log(`All AI models unavailable — serving curated ${goal} plan`);
  return buildFallbackPlan(target, goal, diet);
}
