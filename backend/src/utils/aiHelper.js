import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Diet-specific rules for AI prompt ──────────────────────────────────────
const DIET_RULES = {
  Vegan:
    "STRICT VEGAN: Absolutely no meat, poultry, fish, seafood, eggs, dairy, honey, gelatin, or any animal-derived ingredient. Use only tofu, tempeh, legumes (chickpeas, lentils, black beans, edamame), nuts, seeds, whole grains, plant milks (oat, almond, coconut, soy), and vegetables.",
  Vegetarian:
    "STRICT VEGETARIAN: No meat, poultry, fish, or seafood of any kind. Eggs and dairy products (milk, cheese, yogurt, paneer, butter, cream) are permitted. Use eggs, dairy, legumes, tofu and paneer as main protein sources.",
  Keto:
    "STRICT KETOGENIC: Keep total carbohydrates under 50g per day (aim under 30g net carbs). Fat must make up 65-75% of calories, protein 20-30%, carbs under 10%. Absolutely no bread, rice, pasta, oats, potatoes, sugar, fruit juice, grains, or legumes. Allowed low-carb foods: leafy greens, broccoli, cauliflower, zucchini, avocado, berries in tiny amounts, nuts, cheese, eggs, meat, fish.",
  Omnivore:
    "OMNIVORE: Balanced variety of animal and plant foods. Use only chicken, beef, lamb, turkey, or fish as meat sources. Never include pork, bacon, ham, lard, prosciutto, or alcohol-based ingredients.",
};

// ─── Goal-aware curated plans (Omnivore) ─────────────────────────────────────
const OMNIVORE_PLANS = {
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
    { b: ["Eggs Benedict", "Whole wheat muffin"],                            l: ["Chicken shawarma bowl", "Bulgur", "Tzatziki"],                          s: ["Mixed nuts", "Dried cranberries"],    d: ["Prawn stir-fry", "Jasmine rice", "Pak choi"],                    note: "Midweek check-in — are you eating when hungry, not just bored?", p:[26,40,8,38], c:[30,52,22,44], f:[14,16,12,8], r:[0.25,0.30,0.15,0.30] },
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

// ─── Vegan curated plan (7 days, no animal products) ─────────────────────────
const VEGAN_PLAN = [
  { b:["Oats with oat milk", "Banana", "Chia seeds", "Flaxseed"],                    l:["Chickpea curry", "Brown rice", "Steamed broccoli"],                   s:["Apple", "Peanut butter (1 tbsp)"],             d:["Tofu stir-fry with edamame", "Jasmine rice", "Sesame seeds"],      note:"Chickpeas and tofu together cover your full amino acid profile.", p:[12,18,6,20], c:[58,62,26,52], f:[8,8,8,8],   r:[0.22,0.32,0.12,0.34] },
  { b:["Smoothie (spinach, banana, oat milk, flaxseed, hemp seeds)"],                 l:["Lentil soup", "Whole grain bread", "Lemon wedge"],                    s:["Mixed nuts (25g)", "Dates (3)"],               d:["Black bean tacos", "Guacamole", "Corn tortillas", "Salsa"],        note:"Lentils are among the best plant-based iron sources — eat regularly.", p:[10,20,8,18], c:[65,55,18,58], f:[6,4,14,10], r:[0.22,0.32,0.12,0.34] },
  { b:["Avocado toast on sourdough", "Sliced tomato", "Lemon water"],                 l:["Quinoa salad", "Roasted chickpeas", "Cucumber", "Lemon tahini dressing"],s:["Orange", "Walnuts (20g)"],                   d:["Vegetable noodle stir-fry", "Bok choy", "Sesame soy glaze"],      note:"Quinoa is a complete protein — the only grain with all 9 aminos.", p:[8,16,6,14], c:[42,55,22,58],  f:[18,10,14,8], r:[0.22,0.32,0.12,0.34] },
  { b:["Overnight oats (oat milk)", "Mixed berries", "Pumpkin seeds"],                l:["Falafel wrap", "Hummus", "Rocket leaves", "Pickled onions"],           s:["Banana", "Almond butter (1 tbsp)"],            d:["Pea and spinach dahl", "Basmati rice"],                            note:"Iron absorption from plant foods doubles with vitamin C — add lemon.", p:[12,14,8,18], c:[60,52,30,62], f:[6,14,8,6],  r:[0.22,0.32,0.12,0.34] },
  { b:["Smoothie bowl (mango, coconut milk, granola, shredded coconut)"],             l:["Stuffed bell peppers", "Brown rice and black beans", "Tomato sauce"],  s:["Trail mix (nuts, seeds, raisins)"],             d:["Chickpea tikka masala", "Basmati rice", "Cucumber raita (soy)"],  note:"Beans + rice together form a complete protein — a classic combo.", p:[8,16,6,16], c:[68,58,28,55],  f:[10,6,12,8],  r:[0.22,0.32,0.12,0.34] },
  { b:["Chia pudding (coconut milk)", "Mango", "Granola"],                            l:["Buddha bowl (roasted sweet potato, falafel, kale, tahini dressing)"],  s:["Apple", "Cashews (20g)"],                      d:["Teriyaki tofu", "Steamed broccoli", "Brown rice"],                 note:"Healthy fats in tahini and nuts help absorb fat-soluble vitamins.", p:[10,14,8,18], c:[48,52,22,50], f:[14,18,10,10], r:[0.22,0.32,0.12,0.34] },
  { b:["Banana oat pancakes (banana + oats + plant milk)", "Maple syrup", "Berries"],l:["Veggie bean burger", "Sweet potato fries", "Mixed salad"],             s:["Dates (4)", "Peanut butter"],                  d:["Lentil and vegetable stew", "Crusty sourdough bread"],             note:"One week plant-powered. Your body will thank you — keep the momentum.", p:[10,18,6,20], c:[72,58,32,55], f:[8,8,6,4],  r:[0.22,0.32,0.12,0.34] },
];

// ─── Vegetarian curated plan (7 days, no meat/fish, eggs+dairy ok) ──────────
const VEGETARIAN_PLAN = [
  { b:["Greek yogurt with berries", "Honey", "Granola"],                              l:["Caprese pasta", "Basil", "Olive oil", "Parmesan"],                   s:["Apple", "Cheddar cheese (30g)"],               d:["Paneer tikka masala", "Basmati rice", "Naan"],                    note:"Paneer is a slow-digesting dairy protein — great evening fuel.", p:[22,18,8,26], c:[45,65,20,48], f:[10,14,8,16], r:[0.22,0.32,0.12,0.34] },
  { b:["Scrambled eggs (3)", "Whole wheat toast", "Avocado"],                         l:["Lentil soup", "Sourdough bread", "Side salad"],                      s:["Banana", "Mixed nuts (20g)"],                  d:["Pasta primavera", "Parmesan", "Cherry tomatoes"],                 note:"Eggs are the most bioavailable protein source — start the day right.", p:[28,18,8,20], c:[28,55,28,65], f:[18,8,10,12], r:[0.22,0.32,0.12,0.34] },
  { b:["Bircher muesli", "Apple", "Greek yogurt"],                                    l:["Halloumi salad", "Mixed leaves", "Pomegranate", "Lemon dressing"],    s:["Cottage cheese (150g)", "Cucumber"],            d:["Vegetable and tofu stir-fry", "Brown rice"],                      note:"Halloumi holds up on the grill — satisfying texture and high protein.", p:[16,22,14,20], c:[52,22,8,52],  f:[8,18,4,10], r:[0.22,0.32,0.12,0.34] },
  { b:["Omelette (3 eggs)", "Sautéed mushrooms", "Whole wheat toast"],                l:["Chickpea and spinach stew", "Brown rice"],                           s:["Dates (3)", "Almonds (15g)"],                  d:["Mac and cheese (whole grain)", "Side salad"],                     note:"Chickpeas pack 15g protein per cup — a vegetarian staple.", p:[26,16,6,22], c:[30,55,22,65], f:[18,8,6,14],  r:[0.22,0.32,0.12,0.34] },
  { b:["Smoothie (Greek yogurt, banana, honey, oats)"],                               l:["Quinoa and roasted vegetable bowl", "Feta cheese", "Olives"],        s:["Mixed fruit", "Walnuts (20g)"],                d:["Lentil and vegetable curry", "Roti"],                              note:"Yogurt breakfast gives you probiotics and protein in one shot.", p:[18,20,6,20], c:[65,52,28,55],  f:[6,16,10,8],  r:[0.22,0.32,0.12,0.34] },
  { b:["French toast (x2)", "Fresh berries", "Honey"],                                l:["Caprese sandwich", "Pesto", "Whole grain bread"],                    s:["Greek yogurt (150g)", "Mixed seeds"],           d:["Paneer and vegetable skewers", "Bulgur wheat"],                   note:"Paneer skewers are high-protein and super easy to grill in advance.", p:[18,16,12,24], c:[58,45,16,44], f:[14,18,6,16], r:[0.22,0.32,0.12,0.34] },
  { b:["Avocado and egg cups (2 eggs baked in avocado)", "Whole wheat toast"],        l:["Pasta e fagioli (bean and pasta soup)"],                             s:["Apple", "Peanut butter (1 tbsp)"],             d:["Mushroom and spinach risotto", "Parmesan", "Side salad"],         note:"A full vegetarian week — balanced, varied, and completely nourishing.", p:[22,18,8,16], c:[28,65,28,65], f:[22,8,8,12],  r:[0.22,0.32,0.12,0.34] },
];

// ─── Keto curated plan (7 days, <50g carbs/day) ──────────────────────────────
const KETO_PLAN = [
  { b:["Scrambled eggs (3) in butter", "Avocado (half)", "Smoked salmon"],            l:["Grilled chicken thighs", "Mixed greens salad", "Olive oil dressing"], s:["Walnuts (25g)", "Cheddar cheese (30g)"],       d:["Baked salmon fillet", "Steamed broccoli", "Herb butter"],         note:"Keep carbs under 50g today — check labels on sauces and dressings.", p:[30,42,12,42], c:[2,6,4,8],   f:[28,22,20,28], r:[0.22,0.32,0.12,0.34] },
  { b:["Eggs fried in butter (3)", "Avocado (half)", "Feta cheese"],                  l:["Beef burger patty (no bun)", "Lettuce wrap", "Cheese", "Pickles"],     s:["Macadamia nuts (25g)"],                        d:["Roast chicken thighs", "Cauliflower mash", "Steamed asparagus"],  note:"Cauliflower mash is keto's best friend — creamy and under 5g carbs.", p:[34,38,6,40], c:[4,6,2,8],   f:[30,24,20,26], r:[0.22,0.32,0.12,0.34] },
  { b:["Keto smoothie (coconut milk, avocado, spinach, MCT oil, protein)"],           l:["Lamb chops", "Greek salad (no croutons)", "Feta", "Olive oil"],       s:["Boiled eggs (2)", "Walnuts (15g)"],            d:["Grilled tuna steak", "Zucchini noodles", "Pesto"],                note:"MCT oil converts to ketones rapidly — great sustained morning energy.", p:[10,38,16,36], c:[8,6,2,6],  f:[32,24,14,24], r:[0.22,0.32,0.12,0.34] },
  { b:["Egg and avocado bowl", "Wilted spinach", "Lemon"],                            l:["Chicken Caesar salad (no croutons)", "Parmesan", "Anchovy dressing"], s:["Almonds (25g)", "Celery with cream cheese"],   d:["Beef steak", "Sautéed mushrooms and spinach", "Garlic butter"],   note:"Caesar dressing is keto-friendly — just skip the croutons.", p:[24,36,8,46], c:[4,8,4,4],   f:[26,20,18,28], r:[0.22,0.32,0.12,0.34] },
  { b:["Turkey sausage (no fillers)", "Scrambled eggs (2)", "Avocado"],               l:["Tuna salad with mayo", "Lettuce cups", "Cucumber"],                   s:["Pecans (25g)", "String cheese (2 sticks)"],    d:["Roasted lamb leg", "Roasted broccoli", "Herb butter"],            note:"Keto fat-adaption takes 2-3 weeks — stay consistent through cravings.", p:[32,30,8,44], c:[4,4,2,6],   f:[26,14,20,28], r:[0.22,0.32,0.12,0.34] },
  { b:["Full-fat coconut yogurt", "Mixed seeds", "Berries (small handful)"],          l:["Salmon fillet", "Avocado salsa", "Mixed greens salad"],               s:["Brazil nuts (4)", "Cheddar cheese (30g)"],     d:["Chicken thighs in cream sauce", "Steamed green beans"],           note:"Salmon and avocado together — omega-3s and healthy fats in one meal.", p:[8,34,8,40], c:[10,8,2,6],   f:[18,28,16,30], r:[0.22,0.32,0.12,0.34] },
  { b:["Keto egg muffins (eggs, cheese, peppers) x3"],                                l:["Ground beef bowl", "Cauliflower rice", "Cheese", "Sour cream"],      s:["Olives (10)", "Walnuts (20g)"],                d:["Grilled chicken breast", "Roasted zucchini and peppers", "Pesto"],note:"One week keto — your body is shifting to fat as its primary fuel.", p:[28,36,6,38], c:[6,8,4,6],   f:[22,24,14,22], r:[0.22,0.32,0.12,0.34] },
];

function buildFallbackPlan(calories, goal, diet) {
  const target = calories || 1800;

  let days;
  if (diet === "Vegan") {
    days = VEGAN_PLAN;
  } else if (diet === "Vegetarian") {
    days = VEGETARIAN_PLAN;
  } else if (diet === "Keto") {
    days = KETO_PLAN;
  } else {
    const goalKey = Object.keys(OMNIVORE_PLANS).find((k) => k === goal) || "Lose Weight";
    days = OMNIVORE_PLANS[goalKey];
  }

  return {
    generatedAt: new Date().toISOString(),
    isCurated: true,
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
      ? `Must strictly avoid: ${allergies.join(", ")} — do not include any ingredient that contains these.`
      : "No specific allergies.";

  const mealSchedules = {
    2: "Breakfast (8 AM), Dinner (7 PM)",
    3: "Breakfast (8 AM), Lunch (1 PM), Dinner (7 PM)",
    4: "Breakfast (8 AM), Lunch (1 PM), Snack (4:30 PM), Dinner (7:30 PM)",
    5: "Breakfast (8 AM), Morning Snack (10:30 AM), Lunch (1 PM), Afternoon Snack (4 PM), Dinner (7 PM)",
    6: "Breakfast (7:30 AM), Morning Snack (10 AM), Lunch (12:30 PM), Afternoon Snack (3:30 PM), Dinner (6:30 PM), Evening Snack (9 PM)",
  };
  const schedule = mealSchedules[meals] || mealSchedules[3];
  const dietRule = DIET_RULES[diet] || DIET_RULES.Omnivore;

  const prompt = `You are a certified nutritionist and dietitian. Create a complete, varied 7-day personalized diet plan.

Client profile:
- Goal: ${goal}
- Weight: ${weightKg}kg
- Dietary style: ${diet}
- Meals per day: ${meals} (${schedule})
- Daily calorie target: ${target} kcal
- Allergies: ${allergyText}

CRITICAL DIETARY RULES — You MUST follow these exactly:
${dietRule}

Additional rules:
- Each day must be completely different — vary the meals, never repeat the same day.
- All food items must be real, specific, and properly portioned (e.g. "Grilled chicken breast (150g)" not just "chicken").
- Daily kcal totals must sum to within ±100 of ${target}.
- Protein, carbs and fat values must be realistic for the food items listed.
- The dietary style rule above overrides everything — if it says Vegan, NEVER suggest eggs, meat, dairy, or honey.

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
    }
  }

  console.log(`All AI models unavailable — serving curated ${diet}/${goal} plan`);
  return buildFallbackPlan(target, goal, diet);
}
