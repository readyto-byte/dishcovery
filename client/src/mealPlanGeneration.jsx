/** Format a DB ISO timestamp for the meal plan header */
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

/** Map a `meal_plan` API row (snake_case) into the dashboard form shape */
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

/**
 * Build the same object the meal plan UI uses for the "generated" view,
 * from preference fields (form shape).
 */
export function buildGeneratedPlanFromPreferences(prefs, createdAtIso) {
  const fd = prefs || {};

  const getMealSuggestions = () => {
    let breakfast = { title: "", calories: 0, protein: 0, carbs: 0, fats: 0 };
    let lunch = { title: "", calories: 0, protein: 0, carbs: 0, fats: 0 };
    let dinner = { title: "", calories: 0, protein: 0, carbs: 0, fats: 0 };

    let baseCalories = 2000;
    if (fd.goal === "Weight loss") baseCalories = 1700;
    if (fd.goal === "Muscle gain") baseCalories = 2500;
    if (fd.goal === "Maintain weight") baseCalories = 2100;

    if (fd.activityLevel === "Sedentary") baseCalories -= 200;
    if (fd.activityLevel === "Very active") baseCalories += 300;

    const breakfastCal = Math.round(baseCalories * 0.25);
    const lunchCal = Math.round(baseCalories * 0.35);
    const dinnerCal = Math.round(baseCalories * 0.4);

    if (fd.goal === "Weight loss") {
      breakfast = {
        title: "Greek Yogurt Bowl with Berries & Chia Seeds",
        calories: breakfastCal,
        protein: 28,
        carbs: 35,
        fats: 12,
      };
      lunch = {
        title: "Grilled Chicken Salad with Lemon Vinaigrette",
        calories: lunchCal,
        protein: 42,
        carbs: 18,
        fats: 22,
      };
      dinner = {
        title: "Zucchini Noodles with Turkey Meatballs",
        calories: dinnerCal,
        protein: 38,
        carbs: 22,
        fats: 18,
      };
    } else if (fd.goal === "Muscle gain") {
      breakfast = {
        title: "Protein Oats with Peanut Butter & Banana",
        calories: breakfastCal,
        protein: 35,
        carbs: 55,
        fats: 18,
      };
      lunch = {
        title: "Quinoa Bowl with Chickpeas, Avocado & Salmon",
        calories: lunchCal,
        protein: 48,
        carbs: 52,
        fats: 28,
      };
      dinner = {
        title: "Lean Beef Stir-fry with Brown Rice",
        calories: dinnerCal,
        protein: 52,
        carbs: 58,
        fats: 22,
      };
    } else if (fd.goal === "Maintain weight") {
      breakfast = {
        title: "Avocado Toast with Poached Egg",
        calories: breakfastCal,
        protein: 22,
        carbs: 38,
        fats: 24,
      };
      lunch = {
        title: "Mediterranean Grain Bowl with Hummus",
        calories: lunchCal,
        protein: 35,
        carbs: 48,
        fats: 26,
      };
      dinner = {
        title: "Baked Salmon with Roasted Vegetables",
        calories: dinnerCal,
        protein: 42,
        carbs: 32,
        fats: 30,
      };
    } else {
      breakfast = {
        title: "Smoothie Bowl with Granola",
        calories: breakfastCal,
        protein: 18,
        carbs: 52,
        fats: 14,
      };
      lunch = {
        title: "Turkey and Avocado Wrap",
        calories: lunchCal,
        protein: 38,
        carbs: 42,
        fats: 22,
      };
      dinner = {
        title: "Chicken and Vegetable Stir-fry",
        calories: dinnerCal,
        protein: 44,
        carbs: 38,
        fats: 20,
      };
    }

    if (fd.preferredCuisine === "Italian") {
      lunch = {
        title: "Whole Wheat Pasta with Pesto & Chicken",
        calories: lunchCal,
        protein: 42,
        carbs: 58,
        fats: 28,
      };
      dinner = {
        title: "Minestrone Soup with Caprese Salad",
        calories: dinnerCal,
        protein: 28,
        carbs: 42,
        fats: 24,
      };
    } else if (fd.preferredCuisine === "Mexican") {
      lunch = {
        title: "Black Bean Tacos with Fresh Salsa",
        calories: lunchCal,
        protein: 32,
        carbs: 48,
        fats: 20,
      };
      dinner = {
        title: "Chicken Fajita Bowl with Cilantro Lime Rice",
        calories: dinnerCal,
        protein: 46,
        carbs: 52,
        fats: 26,
      };
    } else if (fd.preferredCuisine === "Asian") {
      breakfast = {
        title: "Congee with Soft Egg & Green Onions",
        calories: breakfastCal,
        protein: 20,
        carbs: 42,
        fats: 16,
      };
      lunch = {
        title: "Buddha Bowl with Edamame & Sesame Dressing",
        calories: lunchCal,
        protein: 36,
        carbs: 44,
        fats: 22,
      };
      dinner = {
        title: "Stir-fried Tofu with Broccoli & Ginger",
        calories: dinnerCal,
        protein: 34,
        carbs: 38,
        fats: 24,
      };
    } else if (fd.preferredCuisine === "Mediterranean") {
      lunch = {
        title: "Greek Salad with Grilled Chicken & Feta",
        calories: lunchCal,
        protein: 44,
        carbs: 28,
        fats: 32,
      };
      dinner = {
        title: "Lemon Herb Fish with Quinoa & Asparagus",
        calories: dinnerCal,
        protein: 48,
        carbs: 42,
        fats: 26,
      };
    } else if (fd.preferredCuisine === "Indian") {
      breakfast = {
        title: "Masala Omelette with Whole Grain Toast",
        calories: breakfastCal,
        protein: 26,
        carbs: 32,
        fats: 22,
      };
      lunch = {
        title: "Chana Masala with Brown Rice",
        calories: lunchCal,
        protein: 32,
        carbs: 52,
        fats: 18,
      };
      dinner = {
        title: "Tandoori Chicken with Roasted Cauliflower",
        calories: dinnerCal,
        protein: 50,
        carbs: 28,
        fats: 28,
      };
    }

    if (fd.carbPreference === "Low Carb") {
      breakfast.carbs = Math.floor(breakfast.carbs * 0.4);
      lunch.carbs = Math.floor(lunch.carbs * 0.4);
      dinner.carbs = Math.floor(dinner.carbs * 0.4);
      breakfast.calories = Math.floor(breakfast.calories * 0.85);
      lunch.calories = Math.floor(lunch.calories * 0.85);
      dinner.calories = Math.floor(dinner.calories * 0.85);
    } else if (fd.carbPreference === "High Carb") {
      breakfast.carbs = Math.floor(breakfast.carbs * 1.4);
      lunch.carbs = Math.floor(lunch.carbs * 1.4);
      dinner.carbs = Math.floor(dinner.carbs * 1.4);
    }

    if (fd.fatPreference === "Low Fat") {
      breakfast.fats = Math.floor(breakfast.fats * 0.5);
      lunch.fats = Math.floor(lunch.fats * 0.5);
      dinner.fats = Math.floor(dinner.fats * 0.5);
    } else if (fd.fatPreference === "Higher Fat (Keto style)") {
      breakfast.fats = Math.floor(breakfast.fats * 1.6);
      lunch.fats = Math.floor(lunch.fats * 1.6);
      dinner.fats = Math.floor(dinner.fats * 1.6);
    }

    return { breakfast, lunch, dinner };
  };

  const meals = getMealSuggestions();

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

  const totalCalories = meals.breakfast.calories + meals.lunch.calories + meals.dinner.calories;
  const totalProtein = meals.breakfast.protein + meals.lunch.protein + meals.dinner.protein;
  const totalCarbs = meals.breakfast.carbs + meals.lunch.carbs + meals.dinner.carbs;
  const totalFats = meals.breakfast.fats + meals.lunch.fats + meals.dinner.fats;

  return {
    ...fd,
    meals,
    groceryList,
    waterGoal,
    snacks,
    totalNutrition: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    },
    createdAt: formatMealPlanCreatedAt(createdAtIso),
  };
}
