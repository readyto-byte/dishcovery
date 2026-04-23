export function formatMealPlanCreatedAt(iso) {
  if (!iso) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function textToKitchenEquipment(text) {
  const base = { stove: false, microwave: false, airFryer: false };
  if (!text || typeof text !== "string") return base;
  const t = text.toLowerCase();
  if (t.includes("stove")) base.stove = true;
  if (t.includes("microwave")) base.microwave = true;
  if (t.includes("air fryer") || t.includes("airfryer")) base.airFryer = true;
  return base;
}

export function mapDbRowToFormData(row) {
  if (!row) return null;
  const h =
    row.height_cm != null && row.height_cm !== ""
      ? `${Number(row.height_cm) % 1 === 0 ? Number(row.height_cm) : Number(row.height_cm).toFixed(1)} cm`
      : "";
  const w =
    row.weight_kg != null && row.weight_kg !== ""
      ? `${Number(row.weight_kg) % 1 === 0 ? Number(row.weight_kg) : Number(row.weight_kg).toFixed(1)} kg`
      : "";
  return {
    age: row.age != null ? String(row.age) : "",
    height: h,
    weight: w,
    goal: row.goal || "",
    foodBudget: row.budget || "",
    maxCookingTime: row.cooking_time || "",
    carbPreference: row.carb_goal || "",
    kitchenEquipment: textToKitchenEquipment(row.available_equipment),
    allergies: row.allergies || "",
    medicalConditions: row.medical_condition || "",
    sexGender: row.sex || "",
    activityLevel: row.activity_level || "",
    preferredCuisine: row.cuisine_pref || "",
    cookingSkillLevel: row.cooking_skill || "",
    fatPreference: row.fat_goal || "",
    foodsDislike: row.dislikes || "",
    mealSchedule: row.schedule || "",
    includeWaterGoal: Boolean(row.hydration_goal),
    includeSnacks: Boolean(row.snack_pref),
    generateGroceryList: Boolean(row.grocery_list),
  };
}

export function buildGeneratedPlanFromPreferences(prefs, createdAtIso) {
  const fd = prefs || {};

  const meals = {
    breakfast: {
      title: "Loading meal plan...",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
    lunch: {
      title: "Loading meal plan...",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
    dinner: {
      title: "Loading meal plan...",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
  };

  let groceryList = [];
  if (fd.generateGroceryList) {
    groceryList = [
      { category: "Proteins", items: ["Chicken breast (2 lbs)", "Salmon fillets (1 lb)", "Eggs (dozen)", "Greek yogurt (32 oz)"] },
      { category: "Vegetables", items: ["Spinach (5 oz)", "Broccoli (1 head)", "Bell peppers (3 count)", "Avocados (2 count)"] },
      { category: "Fruits", items: ["Berries (fresh or frozen)", "Bananas (4 count)", "Lemons (2 count)"] },
      { category: "Grains", items: ["Quinoa (1 cup)", "Oats (rolled)", "Brown rice (1 cup)"] },
      { category: "Pantry", items: ["Olive oil", "Nuts (almonds/walnuts)", "Spices (salt, pepper, garlic powder)"] },
    ];
    if (fd.allergies) {
      groceryList.push({ category: "Allergy Alert", items: [`Avoid: ${fd.allergies}`] });
    }
    if (fd.foodsDislike) {
      groceryList.push({ category: "Foods to Skip", items: [`Do not buy: ${fd.foodsDislike}`] });
    }
  }

  let waterGoal = null;
  if (fd.includeWaterGoal) {
    const activityLevels = {
      Sedentary: "2.5 liters (10 cups)",
      "Lightly active": "3.0 liters (12 cups)",
      "Moderately active": "3.5 liters (14 cups)",
      "Very active": "4.0 liters (16 cups)",
      "Extra active": "4.5 liters (18 cups)",
    };
    waterGoal = activityLevels[fd.activityLevel] || "3.0 liters (12 cups)";
  }

  let snacks = [];
  if (fd.includeSnacks) {
    snacks = [
      { name: "Apple with peanut butter", calories: 180, protein: 5 },
      { name: "Greek yogurt cup", calories: 120, protein: 12 },
      { name: "Handful of almonds (1/4 cup)", calories: 160, protein: 6 },
      { name: "Hummus with veggie sticks", calories: 140, protein: 4 },
    ];
  }

  return {
    ...fd,
    meals,
    groceryList,
    waterGoal,
    snacks,
    totalNutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
    createdAt: formatMealPlanCreatedAt(createdAtIso),
  };
}