import { useState, useEffect } from "react";
import { RotateCcw, Apple, Droplet, ShoppingBag, Clock, ChefHat, Heart, Activity, Ruler, Weight, Calendar, Flame, Coffee, Sun, Moon, AlertCircle, CheckCircle2, Utensils, Target, PlusCircle, Download, X, ChevronRight } from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config.js";
import {
  buildGeneratedPlanFromPreferences,
  mapDbRowToFormData,
  formatMealPlanCreatedAt,
} from "../../mealPlanGeneration";
import jsPDF from 'jspdf';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"];

const defaultPlan = () =>
  Object.fromEntries(DAYS.map((day) => [day, Object.fromEntries(MEAL_SLOTS.map((slot) => [slot, null]))]));

const parseMacroNumber = (value) => {
  if (value == null) return 0;
  const match = String(value).match(/[\d.]+/);
  const num = match ? Number(match[0]) : 0;
  return Number.isFinite(num) ? Math.round(num) : 0;
};

const normalizeMealTitle = (title, fallback) => {
  const raw = String(title || "").trim();
  if (!raw) return fallback;
  const cleaned = raw.replace(/^(breakfast|lunch|dinner)\s*[:\-]\s*/i, "").trim();
  return cleaned || fallback;
};

const hasValue = (v) => !(v === undefined || v === null || String(v).trim() === "");

const isLikelyJumbledToken = (token) => {
  const clean = String(token || "").toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 4) return false;
  const vowelCount = (clean.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / clean.length;
  if (vowelCount === 0) return true;
  if (clean.length >= 7 && vowelRatio < 0.2) return true;
  return false;
};

const hasLikelyJumbledText = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;
  const tokens = text.split(/[\s,;/|]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.some((t) => isLikelyJumbledToken(t));
};

const isFoodLikeFreeText = (value) => {
  const text = String(value || "").trim();
  if (!text) return true;
  if (text.length > 120) return false;
  if (/\d/.test(text)) return false;
  if (!/^[a-zA-Z\s,.'()\-]+$/.test(text)) return false;
  const tokens = text.split(/[\s,;/|]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  if (tokens.some((t) => t.length > 30)) return false;
  return true;
};

const validateMealPlanForm = (fd) => {
  const errors = [];

  const hasAnyInput =
    hasValue(fd.age) ||
    hasValue(fd.height) ||
    hasValue(fd.weight) ||
    hasValue(fd.goal) ||
    hasValue(fd.foodBudget) ||
    hasValue(fd.maxCookingTime) ||
    hasValue(fd.carbPreference) ||
    hasValue(fd.sexGender) ||
    hasValue(fd.activityLevel) ||
    hasValue(fd.preferredCuisine) ||
    hasValue(fd.cookingSkillLevel) ||
    hasValue(fd.fatPreference) ||
    hasValue(fd.allergies) ||
    hasValue(fd.medicalConditions) ||
    hasValue(fd.foodsDislike) ||
    hasValue(fd.mealSchedule) ||
    Boolean(fd.includeWaterGoal) ||
    Boolean(fd.includeSnacks) ||
    Boolean(fd.generateGroceryList) ||
    Boolean(fd.kitchenEquipment?.stove) ||
    Boolean(fd.kitchenEquipment?.microwave) ||
    Boolean(fd.kitchenEquipment?.airFryer);

  if (!hasAnyInput) {
    errors.push("Please enter at least one preference before generating a meal plan.");
  }

  if (hasValue(fd.age)) {
    const raw = String(fd.age).trim();
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || String(n) !== raw) {
      errors.push("Age must be a valid whole number.");
    } else if (n < 10 || n > 120) {
      errors.push("Age must be between 10 and 120.");
    }
  }

  if (hasValue(fd.height)) {
    const s = String(fd.height).trim();
    if (!/\d/.test(s)) {
      errors.push('Height must include numbers (e.g., "170 cm" or "5\'7").');
    }
  }

  if (hasValue(fd.weight)) {
    const s = String(fd.weight).trim();
    if (!/\d/.test(s)) {
      errors.push('Weight must include numbers (e.g., "70 kg" or "154 lbs").');
    }
  }

  if (hasValue(fd.allergies) && hasLikelyJumbledText(fd.allergies)) {
    errors.push('Allergies looks invalid. Use clear words (e.g., "Nuts, Dairy").');
  }
  if (hasValue(fd.allergies) && !isFoodLikeFreeText(fd.allergies)) {
    errors.push('Allergies must be real words only (letters/commas). Example: "Nuts, Dairy".');
  }
  if (hasValue(fd.medicalConditions) && hasLikelyJumbledText(fd.medicalConditions)) {
    errors.push('Medical conditions looks invalid. Use clear words (e.g., "Diabetes").');
  }
  if (hasValue(fd.medicalConditions) && !isFoodLikeFreeText(fd.medicalConditions)) {
    errors.push('Medical conditions must be real words only (letters/commas). Example: "Diabetes".');
  }
  if (hasValue(fd.foodsDislike) && hasLikelyJumbledText(fd.foodsDislike)) {
    errors.push('Foods to avoid looks invalid. Use clear words (e.g., "Onion, Ampalaya").');
  }
  if (hasValue(fd.foodsDislike) && !isFoodLikeFreeText(fd.foodsDislike)) {
    errors.push('Foods to avoid must be food words only (letters/commas). Example: "Onion, Ampalaya".');
  }

  return { ok: errors.length === 0, errors };
};

const buildAiGeneratedPlan = (fd, aiResponse, createdAtIso) => {
  const suggestions = Array.isArray(aiResponse?.suggestions) ? aiResponse.suggestions : [];
  if (suggestions.length < 3) {
    throw new Error("AI returned fewer than 3 meal suggestions.");
  }

  const breakfastSource = suggestions[0] || {};
  const lunchSource = suggestions[1] || {};
  const dinnerSource = suggestions[2] || {};

  const breakfast = {
    title: normalizeMealTitle(breakfastSource.title, "AI Breakfast"),
    calories: Number(breakfastSource?.nutritionalInfo?.calories) || 0,
    protein: parseMacroNumber(breakfastSource?.nutritionalInfo?.protein),
    carbs: parseMacroNumber(breakfastSource?.nutritionalInfo?.carbs),
    fats: parseMacroNumber(breakfastSource?.nutritionalInfo?.fat),
  };
  const lunch = {
    title: normalizeMealTitle(lunchSource.title, "AI Lunch"),
    calories: Number(lunchSource?.nutritionalInfo?.calories) || 0,
    protein: parseMacroNumber(lunchSource?.nutritionalInfo?.protein),
    carbs: parseMacroNumber(lunchSource?.nutritionalInfo?.carbs),
    fats: parseMacroNumber(lunchSource?.nutritionalInfo?.fat),
  };
  const dinner = {
    title: normalizeMealTitle(dinnerSource.title, "AI Dinner"),
    calories: Number(dinnerSource?.nutritionalInfo?.calories) || 0,
    protein: parseMacroNumber(dinnerSource?.nutritionalInfo?.protein),
    carbs: parseMacroNumber(dinnerSource?.nutritionalInfo?.carbs),
    fats: parseMacroNumber(dinnerSource?.nutritionalInfo?.fat),
  };

  const base = buildGeneratedPlanFromPreferences(fd, createdAtIso);
  const totalCalories = breakfast.calories + lunch.calories + dinner.calories;
  const totalProtein = breakfast.protein + lunch.protein + dinner.protein;
  const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs;
  const totalFats = breakfast.fats + lunch.fats + dinner.fats;

  return {
    ...base,
    meals: { breakfast, lunch, dinner },
    totalNutrition: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    },
    createdAt: formatMealPlanCreatedAt(createdAtIso),
  };
};

const fetchAiMealPlan = async (fd, createdAtIso) => {
  const res = await apiCall("/api/meal-plans/generate", {
    method: "POST",
    body: JSON.stringify(fd),
  });
  return buildAiGeneratedPlan(fd, res?.response, createdAtIso);
};

const getEmptyMealPlanFormData = () => ({
  age: "",
  height: "",
  goal: "",
  foodBudget: "",
  maxCookingTime: "",
  carbPreference: "",
  kitchenEquipment: {
    stove: false,
    microwave: false,
    airFryer: false,
    oven: false,
  },
  allergies: "",
  medicalConditions: "",
  sexGender: "",
  weight: "",
  activityLevel: "",
  preferredCuisine: "",
  cookingSkillLevel: "",
  fatPreference: "",
  foodsDislike: "",
  mealSchedule: "",
  includeWaterGoal: false,
  includeSnacks: false,
  generateGroceryList: false,
});

// Loading Animation Component inside Meal Plan Section
const MealPlanLoadingCard = ({ message }) => {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "Analyzing your preferences...",
    "Creating personalized meals...",
    "Calculating nutritional values...",
    "Balancing your macros...",
    "Preparing your grocery list...",
    "Almost there...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-4 md:mx-8 mb-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Loading header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                <Apple className="w-6 h-6 text-[#B5D098]" /> Creating Your Meal Plan
              </h2>
              <p className="text-[#B5D098] text-sm mt-1">Please wait while we personalize your plan</p>
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className="p-12 flex flex-col items-center justify-center">
          {/* Animated spinner */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#B5D098]/30" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#587A34] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#839705] border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Utensils className="w-8 h-8 text-[#587A34] animate-pulse" />
            </div>
          </div>

          {/* Loading text */}
          <h3 className="text-[#32491B] text-lg font-bold mb-2">{loadingMessages[loadingMessageIndex]}</h3>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#587A34]/40 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: '0.8s' }}
              />
            ))}
          </div>

          {/* Tip message */}
          <div className="mt-8 max-w-md mx-auto px-4 py-3 bg-[#f5f9ef] rounded-xl border border-[#B5D098]/30">
            <p className="text-[#587A34] text-xs text-center">
              💡 Tip: The more details you provide, the more personalized your meal plan will be!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MealPlanPage = ({ onViewRecipe, activeProfile }) => {
  const [plan, setPlan] = useState(defaultPlan());
  const [activeSlot, setActiveSlot] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDetailLoading, setMealDetailLoading] = useState(false);

  const [formData, setFormData] = useState(getEmptyMealPlanFormData);

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [mealPlanSaveError, setMealPlanSaveError] = useState(null);
  const [mealPlanSaveOk, setMealPlanSaveOk] = useState(false);
  const [mealPlanSaving, setMealPlanSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const formValidation = validateMealPlanForm(formData);
  const activeProfileId = activeProfile?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrating(true);
      setGeneratedPlan(null);
      setShowForm(true);
      setFormData(getEmptyMealPlanFormData());
      setMealPlanSaveError(null);
      setMealPlanSaveOk(false);
      try {
        const query = activeProfileId ? `?profileId=${encodeURIComponent(activeProfileId)}` : "";
        const res = await apiCall(`/api/meal-plans/active${query}`);
        if (cancelled) return;
        const row = res?.data;
        if (!row) {
          setFormData(getEmptyMealPlanFormData());
          setGeneratedPlan(null);
          setShowForm(true);
          return;
        }
        if (row) {
          const form = mapDbRowToFormData(row);
          if (form) {
            let gen = null;
            try {
              gen = await fetchAiMealPlan(form, row.created_at);
            } catch {
              gen = buildGeneratedPlanFromPreferences(form, row.created_at);
            }
            setFormData(form);
            setGeneratedPlan(gen);
            setShowForm(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setMealPlanSaveError(err?.message || "Could not load meal plan for this profile.");
          setShowForm(true);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeProfileId]);

  const fetchMealDetail = async (meal, type) => {
    setSelectedMeal({
      type,
      title: meal.title,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      prepTime: null,
      cookTime: null,
      servings: null,
      difficulty: null,
      description: null,
      ingredients: null,
      instructions: null,
      tags: null,
    });
    setMealDetailLoading(true);

    try {
      const res = await apiCall("/api/recipes/meal-detail", {
        method: "POST",
        body: JSON.stringify({ title: meal.title }),
      });

      const detail = res?.detail || {};

      setSelectedMeal(prev => ({
        ...prev,
        prepTime: detail.prepTime || "10 min",
        cookTime: detail.cookTime || "20 min",
        servings: detail.servings || "1 serving",
        difficulty: detail.difficulty || "Easy",
        description: detail.description || `A personalized ${type.toLowerCase()} meal tailored to your nutrition goals.`,
        ingredients: Array.isArray(detail.ingredients) && detail.ingredients.length
          ? detail.ingredients
          : ["Ingredients unavailable — please try again."],
        instructions: Array.isArray(detail.instructions) && detail.instructions.length
          ? detail.instructions
          : ["Instructions unavailable — please try again."],
        tags: Array.isArray(detail.tags) && detail.tags.length
          ? detail.tags
          : [type, "Healthy"],
      }));
    } catch {
      setSelectedMeal(prev => ({
        ...prev,
        prepTime: "—",
        cookTime: "—",
        servings: "1 serving",
        difficulty: "Easy",
        description: `A personalized ${type.toLowerCase()} meal tailored to your nutrition goals.`,
        ingredients: ["Could not load ingredients. Please try again."],
        instructions: ["Could not load instructions. Please try again."],
        tags: [type, "Healthy"],
      }));
    } finally {
      setMealDetailLoading(false);
    }
  };

  const handleSlotClick = (day, meal) => {
    setActiveSlot({ day, meal });
    setInputValue(plan[day][meal]?.title || "");
  };

  const handleSave = () => {
    if (!activeSlot) return;
    const { day, meal } = activeSlot;
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: inputValue.trim() ? { title: inputValue.trim() } : null,
      },
    }));
    setActiveSlot(null);
    setInputValue("");
  };

  const handleClear = (day, meal, e) => {
    e.stopPropagation();
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: null },
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKitchenEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      kitchenEquipment: {
        ...prev.kitchenEquipment,
        [equipment]: !prev.kitchenEquipment[equipment],
      },
    }));
  };

  const resetForm = () => {
    setFormData(getEmptyMealPlanFormData());
  };

  const generateMealPlan = async () => {
    const snapshot = { ...formData };
    const validation = validateMealPlanForm(snapshot);
    if (!validation.ok) {
      setMealPlanSaveError(`Please fix: ${validation.errors.join(" ")}`);
      setMealPlanSaveOk(false);
      setMealPlanSaving(false);
      setShowForm(true);
      return;
    }
    
    setIsGeneratingPlan(true);
    setShowForm(false);
    setMealPlanSaveError(null);
    setMealPlanSaveOk(false);
    setMealPlanSaving(true);
    
    try {
      let built = null;
      try {
        built = await fetchAiMealPlan(snapshot);
      } catch {
        built = buildGeneratedPlanFromPreferences(snapshot);
      }
      setGeneratedPlan(built);

      const res = await apiCall("/api/meal-plans", {
        method: "POST",
        body: JSON.stringify({ ...snapshot, profileId: activeProfileId }),
      });
      setMealPlanSaveOk(true);
      if (res?.data?.created_at) {
        setGeneratedPlan((prev) =>
          prev ? { ...prev, createdAt: formatMealPlanCreatedAt(res.data.created_at) } : prev
        );
      }
    } catch (err) {
      setMealPlanSaveError(err?.message || "Could not save your meal plan preferences.");
    } finally {
      setMealPlanSaving(false);
      setIsGeneratingPlan(false);
    }
  };

  const handleNewMealPlan = async () => {
    try {
      await apiCall("/api/meal-plans/deactivate-active", {
        method: "POST",
        body: JSON.stringify({ profileId: activeProfileId }),
      });
    } catch {}
    resetForm();
    setGeneratedPlan(null);
    setShowForm(true);
    setMealPlanSaveError(null);
    setMealPlanSaveOk(false);
    setMealPlanSaving(false);
  };

  const downloadMealPlan = async () => {
    if (!generatedPlan) { alert("No meal plan to download"); return; }
    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pageWidth = 210;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPageBreak = (needed = 10) => {
        if (y + needed > 280) { pdf.addPage(); y = 20; }
      };

      pdf.setFontSize(22); pdf.setTextColor(30, 58, 15);
      pdf.text("Your Personalized Meal Plan", margin, y); y += 8;
      pdf.setFontSize(10); pdf.setTextColor(120, 120, 120);
      pdf.text(`Generated on ${generatedPlan.createdAt || "—"}`, margin, y); y += 14;
      pdf.setDrawColor(181, 208, 152); pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y); y += 10;

      pdf.setFontSize(14); pdf.setTextColor(30, 58, 15);
      pdf.text("Profile Summary", margin, y); y += 7;
      pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);

      const profileRows = [
        [`Age: ${generatedPlan.age || "—"}`, `Height: ${generatedPlan.height || "—"}`, `Weight: ${generatedPlan.weight || "—"}`],
        [`Goal: ${generatedPlan.goal || "Not specified"}`, `Activity: ${generatedPlan.activityLevel || "Not specified"}`],
        [`Cuisine: ${generatedPlan.preferredCuisine || "Not specified"}`, `Cooking Time: ${generatedPlan.maxCookingTime || "Not specified"}`],
        [`Skill Level: ${generatedPlan.cookingSkillLevel || "Not specified"}`, `Meal Schedule: ${generatedPlan.mealSchedule || "Not specified"}`],
      ];
      profileRows.forEach(cols => {
        checkPageBreak();
        const colWidth = contentWidth / cols.length;
        cols.forEach((col, i) => { pdf.text(col, margin + i * colWidth, y); });
        y += 6;
      });

      if (generatedPlan.allergies || generatedPlan.medicalConditions || generatedPlan.foodsDislike) {
        y += 3; pdf.setFontSize(11); pdf.setTextColor(180, 60, 60);
        pdf.text("Health Notes", margin, y); y += 6; pdf.setFontSize(10);
        if (generatedPlan.allergies) { checkPageBreak(); pdf.text(`• Allergies: ${generatedPlan.allergies}`, margin + 3, y); y += 6; }
        if (generatedPlan.medicalConditions) { checkPageBreak(); pdf.text(`• Medical Conditions: ${generatedPlan.medicalConditions}`, margin + 3, y); y += 6; }
        if (generatedPlan.foodsDislike) { checkPageBreak(); pdf.text(`• Foods to Avoid: ${generatedPlan.foodsDislike}`, margin + 3, y); y += 6; }
      }

      y += 4; pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 10;
      pdf.setFontSize(14); pdf.setTextColor(30, 58, 15); pdf.text("Daily Meal Plan", margin, y); y += 10;

      const pdfMeals = [
        { label: "Breakfast", data: generatedPlan.meals.breakfast, color: [180, 120, 30] },
        { label: "Lunch", data: generatedPlan.meals.lunch, color: [50, 140, 80] },
        { label: "Dinner", data: generatedPlan.meals.dinner, color: [88, 122, 52] },
      ];
      pdfMeals.forEach(({ label, data, color }) => {
        checkPageBreak(22);
        pdf.setFontSize(12); pdf.setTextColor(...color); pdf.text(label, margin, y); y += 6;
        pdf.setFontSize(11); pdf.setTextColor(30, 30, 30);
        const titleLines = pdf.splitTextToSize(data.title, contentWidth);
        titleLines.forEach(line => { checkPageBreak(); pdf.text(line, margin + 3, y); y += 5; });
        pdf.setFontSize(9); pdf.setTextColor(110, 110, 110);
        pdf.text(`${data.calories} kcal  ·  Protein: ${data.protein}g  ·  Carbs: ${data.carbs}g  ·  Fats: ${data.fats}g`, margin + 3, y);
        y += 10;
      });

      checkPageBreak(14); pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 7;
      pdf.setFontSize(12); pdf.setTextColor(30, 58, 15); pdf.text("Daily Total", margin, y); y += 6;
      pdf.setFontSize(10); pdf.setTextColor(50, 50, 50);
      pdf.text(`${generatedPlan.totalNutrition.calories} kcal  ·  Protein: ${generatedPlan.totalNutrition.protein}g  ·  Carbs: ${generatedPlan.totalNutrition.carbs}g  ·  Fats: ${generatedPlan.totalNutrition.fats}g`, margin, y);
      y += 12;

      checkPageBreak(18); pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 8;
      pdf.setFontSize(12); pdf.setTextColor(30, 58, 15); pdf.text("Nutrition Preferences", margin, y); y += 7;
      pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);
      const equipmentUsed = Object.entries(generatedPlan.kitchenEquipment || {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "None specified";
      const prefRows = [
        [`Carb Preference: ${generatedPlan.carbPreference || "Moderate"}`, `Fat Preference: ${generatedPlan.fatPreference || "Moderate"}`],
        [`Budget: ${generatedPlan.foodBudget || "Not specified"}`, `Equipment: ${equipmentUsed}`],
      ];
      prefRows.forEach(cols => {
        checkPageBreak();
        const colWidth = contentWidth / cols.length;
        cols.forEach((col, i) => { pdf.text(col, margin + i * colWidth, y); });
        y += 6;
      });

      if (generatedPlan.includeSnacks && generatedPlan.snacks?.length > 0) {
        y += 4; checkPageBreak(10); pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 8;
        pdf.setFontSize(12); pdf.setTextColor(30, 58, 15); pdf.text("Snack Recommendations", margin, y); y += 7;
        pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);
        generatedPlan.snacks.forEach(snack => { checkPageBreak(); pdf.text(`• ${snack.name}  (${snack.calories} cal, ${snack.protein}g protein)`, margin + 3, y); y += 6; });
      }

      if (generatedPlan.includeWaterGoal && generatedPlan.waterGoal) {
        y += 4; checkPageBreak(12); pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 8;
        pdf.setFontSize(12); pdf.setTextColor(30, 58, 15); pdf.text("Daily Water Goal", margin, y); y += 7;
        pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);
        pdf.text(`Aim for ${generatedPlan.waterGoal} per day based on your activity level.`, margin, y); y += 6;
      }

      if (generatedPlan.generateGroceryList && generatedPlan.groceryList?.length > 0) {
        y += 4; checkPageBreak(10); pdf.setDrawColor(181, 208, 152); pdf.line(margin, y, pageWidth - margin, y); y += 8;
        pdf.setFontSize(12); pdf.setTextColor(30, 58, 15); pdf.text("Grocery List", margin, y); y += 8;
        generatedPlan.groceryList.forEach(category => {
          checkPageBreak(12); pdf.setFontSize(11); pdf.setTextColor(88, 122, 52); pdf.text(category.category, margin, y); y += 6;
          pdf.setFontSize(10); pdf.setTextColor(60, 60, 60);
          category.items.forEach(item => { checkPageBreak(); pdf.text(`• ${item}`, margin + 4, y); y += 5; });
          y += 3;
        });
      }

      y += 6; checkPageBreak(12); pdf.setDrawColor(200, 200, 200); pdf.line(margin, y, pageWidth - margin, y); y += 6;
      pdf.setFontSize(8); pdf.setTextColor(160, 160, 160);
      const footerLines = pdf.splitTextToSize("Adjust portions to meet your caloric needs. Please consult with your healthcare provider before starting any new meal plan.", contentWidth);
      footerLines.forEach(line => { pdf.text(line, margin, y); y += 4; });

      pdf.save(`meal-plan-${generatedPlan.createdAt || 'my-plan'}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again. Error: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  if (hydrating) {
    return (
      <div className="pb-12">
        <style>{`
          @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
          @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          .skeleton { background: linear-gradient(90deg, #e8f2dc 25%, #d4e9c0 50%, #e8f2dc 75%); background-size: 600px 100%; animation: shimmer 1.6s infinite linear; border-radius: 8px; }
        `}</style>
        <div className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl bg-[#1e3a0f]/80 px-8 py-7">
          <div className="space-y-2">
            <div className="skeleton h-8 w-40 opacity-30" />
            <div className="skeleton h-4 w-56 opacity-20" />
          </div>
        </div>
        <div className="mx-4 md:mx-8 mb-6 flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#587A34]" style={{ animation: `pulse-glow 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span className="text-[#587A34] text-sm font-semibold tracking-wide">Loading your meal plan…</span>
        </div>
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-2">
                  <div className="skeleton h-7 w-64 opacity-30" />
                  <div className="skeleton h-4 w-40 opacity-20" />
                </div>
                <div className="skeleton h-9 w-32 opacity-20 rounded-lg" />
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#f5f9ef] rounded-xl p-5 border border-[#B5D098]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="skeleton h-5 w-40" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="skeleton w-4 h-4 rounded" />
                      <div className="skeleton h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["bg-amber-50 border-amber-100", "bg-green-50 border-green-100", "bg-[#E6F0DA] border-[#B5D098]"].map((cls, i) => (
                  <div key={i} className={`${cls} rounded-xl p-4 border`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="skeleton w-5 h-5 rounded" />
                      <div className="skeleton h-4 w-20" />
                    </div>
                    <div className="skeleton h-5 w-full mb-1" />
                    <div className="skeleton h-5 w-3/4 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(4)].map((_, j) => <div key={j} className="skeleton h-6 w-16 rounded-full" />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center pt-4 pb-6 px-6">
              <div className="skeleton h-12 w-56 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center rounded-2xl" style={{ backgroundImage: `url(${heroBg})`, filter: "brightness(0.7)" }} />
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-5 z-10">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              Meal <span className="text-[#B5D098]">Plan</span>
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">Make your meal plans more personalized.</p>
          </div>
        </div>
      </div>

      {isGeneratingPlan && <MealPlanLoadingCard />}

      {showForm && !isGeneratingPlan && (
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
              <h2 className="text-white font-bold text-xl">Personalized Meal Planner</h2>
              <p className="text-[#B5D098] text-sm">Tell us about yourself and we'll create a custom meal plan</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleFormChange} placeholder="e.g., 25" min='10' className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Height</label>
                  <input type="text" name="height" value={formData.height} onChange={handleFormChange} placeholder="e.g., 170 cm or 5'7 in" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Goal</label>
                  <select name="goal" value={formData.goal} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Weight loss">Weight loss</option>
                    <option value="Muscle gain">Muscle gain</option>
                    <option value="Maintain weight">Maintain weight</option>
                    <option value="Improve energy">Improve energy</option>
                    <option value="Better digestion">Better digestion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Food Budget</label>
                  <select name="foodBudget" value={formData.foodBudget} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Low ($ - under $50/week)">Low ($ - under $50/week)</option>
                    <option value="Medium ($$ - $50-$100/week)">Medium ($$ - $50-$100/week)</option>
                    <option value="High ($$$ - $100+/week)">High ($$$ - $100+/week)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Cooking Time</label>
                  <select name="maxCookingTime" value={formData.maxCookingTime} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour+">1 hour+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Carb Preference</label>
                  <select name="carbPreference" value={formData.carbPreference} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Low Carb">Low Carb</option>
                    <option value="Moderate Carb">Moderate Carb</option>
                    <option value="High Carb">High Carb</option>
                    <option value="Keto friendly">Keto friendly</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kitchen Equipment Available</label>
                  <div className="flex gap-6">
                    {[["stove", "Stove"], ["microwave", "Microwave"], ["airFryer", "Air fryer"], ["oven", "Oven"]].map(([key, label]) => (  
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.kitchenEquipment[key]} onChange={() => handleKitchenEquipmentChange(key)} className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]" />
                        <span className="text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Allergies (if any)</label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleFormChange} placeholder="e.g., Nuts, Dairy, Seafood" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Medical Conditions (if any)</label>
                  <input type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleFormChange} placeholder="e.g., Diabetes, Hypertension" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sex/Gender</label>
                  <select name="sexGender" value={formData.sexGender} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Weight</label>
                  <input type="text" name="weight" value={formData.weight} onChange={handleFormChange} placeholder="e.g., 70 kg or 154 lbs" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Sedentary">Sedentary (little or no exercise)</option>
                    <option value="Lightly active">Lightly active (1-3 days/week)</option>
                    <option value="Moderately active">Moderately active (3-5 days/week)</option>
                    <option value="Very active">Very active (6-7 days/week)</option>
                    <option value="Extra active">Extra active (physical job + training)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Cuisine</label>
                  <select name="preferredCuisine" value={formData.preferredCuisine} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Asian">Asian</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Indian">Indian</option>
                    <option value="American">American</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cooking Skill Level</label>
                  <select name="cookingSkillLevel" value={formData.cookingSkillLevel} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Beginner">Beginner (minimal experience)</option>
                    <option value="Intermediate">Intermediate (comfortable with recipes)</option>
                    <option value="Advanced">Advanced (confident cook)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fat Preference</label>
                  <select name="fatPreference" value={formData.fatPreference} onChange={handleFormChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition">
                    <option value="">Select...</option>
                    <option value="Low Fat">Low Fat</option>
                    <option value="Moderate Healthy Fats">Moderate Healthy Fats</option>
                    <option value="Higher Fat (Keto style)">Higher Fat (Keto style)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Foods You Dislike</label>
                  <input type="text" name="foodsDislike" value={formData.foodsDislike} onChange={handleFormChange} placeholder="e.g., Ampalaya, Onion" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Meal Schedule</label>
                  <input type="text" name="mealSchedule" value={formData.mealSchedule} onChange={handleFormChange} placeholder="e.g., 7AM, 12PM, 7PM" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition" />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-6">
                {[["includeWaterGoal", "Include water goal"], ["includeSnacks", "Include snacks"], ["generateGroceryList", "Generate grocery list"]].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleFormChange} className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]" />
                    <span className="text-gray-700 font-medium">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={generateMealPlan}
                  disabled={mealPlanSaving || !formValidation.ok}
                  className="bg-[#587A34] hover:bg-[#3c5a23] text-white font-bold py-3.5 px-10 rounded-xl shadow-md transition-all text-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Utensils className="w-5 h-5" /> {mealPlanSaving ? "Generating..." : "Generate My Meal Plan"}
                </button>
              </div>

              {!formValidation.ok && (
                <p className="mt-3 text-xs text-red-700 text-center">
                  {formValidation.errors?.[0] || "Please fix the highlighted inputs to generate your meal plan."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Meal Plan Card */}
      {!showForm && generatedPlan && !isGeneratingPlan && (
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                    <Apple className="w-6 h-6 text-[#B5D098]" /> Your Personalized Meal Plan
                  </h2>
                  <p className="text-[#B5D098] text-sm mt-1">Generated on {generatedPlan.createdAt}</p>
                </div>
                <button onClick={downloadMealPlan} disabled={downloading} className="bg-white/20 hover:bg-white/30 transition-all px-4 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download className="w-4 h-4" /> {downloading ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {mealPlanSaving && <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">Saving your preferences…</p>}
              {mealPlanSaveOk && !mealPlanSaving && (
                <p className="text-sm text-[#32491B] bg-[#e8f2dc] border border-[#B5D098]/50 rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Your meal plan preferences were saved to your account.
                </p>
              )}
              {mealPlanSaveError && (
                <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {mealPlanSaveError}
                </p>
              )}

              {/* Profile Summary */}
              <div className="bg-[#f5f9ef] rounded-xl p-5 border border-[#B5D098]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#587A34]/10 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#587A34]" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Your Profile Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    [Calendar, "Age", generatedPlan.age],
                    [Ruler, "Height", generatedPlan.height],
                    [Weight, "Weight", generatedPlan.weight],
                    [Target, "Goal", generatedPlan.goal],
                    [Activity, "Activity", generatedPlan.activityLevel],
                    [ChefHat, "Cuisine", generatedPlan.preferredCuisine],
                    [Clock, "Cooking Time", generatedPlan.maxCookingTime],
                    [Utensils, "Skill Level", generatedPlan.cookingSkillLevel],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#587A34]" />
                      <span className="text-sm text-gray-600">{label}: <span className="font-semibold">{value || "—"}</span></span>
                    </div>
                  ))}
                </div>
                {(generatedPlan.allergies || generatedPlan.medicalConditions || generatedPlan.foodsDislike) && (
                  <div className="mt-4 pt-3 border-t border-[#B5D098]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-gray-700 text-sm">Health Notes</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {generatedPlan.allergies && <div className="flex items-center gap-1"><span className="text-gray-500">Allergies:</span><span className="text-red-600 font-medium">{generatedPlan.allergies}</span></div>}
                      {generatedPlan.medicalConditions && <div className="flex items-center gap-1"><span className="text-gray-500">Medical:</span><span className="text-amber-600 font-medium">{generatedPlan.medicalConditions}</span></div>}
                      {generatedPlan.foodsDislike && <div className="flex items-center gap-1"><span className="text-gray-500">Avoid:</span><span className="text-red-600 font-medium">{generatedPlan.foodsDislike}</span></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Meal Plan — clickable cards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#587A34]/10 rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-[#587A34]" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Daily Meal Plan</h3>
                  {generatedPlan.mealSchedule && <span className="text-sm text-gray-500 ml-2">({generatedPlan.mealSchedule})</span>}
                </div>

                <p className="text-xs text-gray-400 mb-3 italic">Tap a meal card to view full recipe details.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: "Breakfast", data: generatedPlan.meals.breakfast, icon: <Coffee className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50", border: "border-amber-100", hover: "hover:border-amber-300" },
                    { type: "Lunch", data: generatedPlan.meals.lunch, icon: <Sun className="w-5 h-5 text-green-600" />, bg: "bg-green-50", border: "border-green-100", hover: "hover:border-green-300" },
                    { type: "Dinner", data: generatedPlan.meals.dinner, icon: <Moon className="w-5 h-5 text-[#587A34]" />, bg: "bg-[#E6F0DA]", border: "border-[#B5D098]", hover: "hover:border-[#587A34]" },
                  ].map(({ type, data, icon, bg, border, hover }) => (
                    <button
                      key={type}
                      onClick={() => fetchMealDetail(data, type)}
                      className={`${bg} rounded-xl p-4 border ${border} ${hover} text-left w-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {icon}
                          <h4 className="font-bold text-gray-800">{type}</h4>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <p className="font-medium text-gray-800 text-sm leading-snug mb-3">{data.title}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white px-2 py-1 rounded-full text-amber-700">{data.calories} cal</span>
                        <span className="bg-white px-2 py-1 rounded-full text-blue-700">{data.protein}g protein</span>
                        <span className="bg-white px-2 py-1 rounded-full text-green-700">{data.carbs}g carbs</span>
                        <span className="bg-white px-2 py-1 rounded-full text-orange-700">{data.fats}g fats</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Daily Total */}
                <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-gray-700">Daily Total:</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-medium text-amber-700">{generatedPlan.totalNutrition.calories} calories</span>
                      <span className="font-medium text-blue-700">{generatedPlan.totalNutrition.protein}g protein</span>
                      <span className="font-medium text-green-700">{generatedPlan.totalNutrition.carbs}g carbs</span>
                      <span className="font-medium text-orange-700">{generatedPlan.totalNutrition.fats}g fats</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition Preferences */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="w-4 h-4 text-[#587A34]" />
                  <h3 className="font-semibold text-gray-800">Personalized Nutrition Settings</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /><span className="text-gray-600">Carbs: <span className="font-medium">{generatedPlan.carbPreference || "Moderate"}</span></span></div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /><span className="text-gray-600">Fats: <span className="font-medium">{generatedPlan.fatPreference || "Moderate"}</span></span></div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /><span className="text-gray-600">Budget: <span className="font-medium">{generatedPlan.foodBudget || "Not specified"}</span></span></div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /><span className="text-gray-600">Equipment: <span className="font-medium">{Object.entries(generatedPlan.kitchenEquipment).filter(([, v]) => v).map(([k]) => k).join(", ") || "None specified"}</span></span></div>
                </div>
              </div>

              {/* Snacks */}
              {generatedPlan.includeSnacks && generatedPlan.snacks?.length > 0 && (
                <div className="border-l-4 border-[#B5D098] pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-4 h-4 text-[#587A34]" />
                    <p className="font-semibold text-gray-700">Snack Recommendations</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generatedPlan.snacks.map((snack, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-2 text-sm">
                        <span className="font-medium">{snack.name}</span>
                        <span className="text-gray-500 text-xs ml-1">({snack.calories} cal, {snack.protein}g protein)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Water Goal */}
              {generatedPlan.includeWaterGoal && generatedPlan.waterGoal && (
                <div className="border-l-4 border-[#587A34] pl-4">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <p className="font-semibold text-gray-700">Daily Water Goal</p>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Aim for {generatedPlan.waterGoal} per day based on your activity level.</p>
                </div>
              )}

              {/* Grocery List */}
              {generatedPlan.generateGroceryList && generatedPlan.groceryList?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-5 h-5 text-[#587A34]" />
                    <p className="font-bold text-gray-800">Smart Grocery List</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPlan.groceryList.map((category, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-[#587A34] text-sm mb-2">{category.category}</h4>
                        <ul className="space-y-1">
                          {category.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-gray-600 text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400 italic mt-2 pt-2 border-t border-gray-100">
                Plan generated dynamically based on your inputs. Adjust portions to meet your caloric needs.
                Please consult with your healthcare provider before starting any new meal plan.
              </div>
            </div>

            <div className="flex justify-center pt-4 pb-6 px-6">
              <button onClick={handleNewMealPlan} className="bg-[#587A34] hover:bg-[#3c5a23] text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Generate New Meal Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-[#d6e8c0]"
            style={{ background: "linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #587A34 0%, #3a5220 100%)" }}>
              <button onClick={() => setSelectedMeal(null)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1 h-1 rounded-full bg-[#B5D098]" />
                <span className="text-[#B5D098] text-[10px] font-semibold uppercase tracking-[0.15em]">{selectedMeal.type}</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#F0E6D1] leading-tight tracking-tight mb-3 pr-8">{selectedMeal.title}</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "fa-kitchen-set", label: "Prep", value: selectedMeal.prepTime },
                  { icon: "fa-clock", label: "Cook", value: selectedMeal.cookTime },
                  { icon: "fa-users", label: "Serves", value: selectedMeal.servings },
                  { icon: "fa-chart-simple", label: "Level", value: selectedMeal.difficulty },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                    <i className={`fas ${icon} text-[#B5D098] text-xs`} />
                    <span className="text-[#F0E6D1]/60 text-[11px]">{label}</span>
                    <span className="text-[#F0E6D1] text-[11px] font-bold">
                      {value ?? <span className="opacity-40 animate-pulse">…</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: `${selectedMeal.calories} cal`, color: "text-amber-700" },
                  { label: `${selectedMeal.protein}g protein`, color: "text-blue-700" },
                  { label: `${selectedMeal.carbs}g carbs`, color: "text-green-700" },
                  { label: `${selectedMeal.fats}g fats`, color: "text-orange-700" },
                ].map(({ label, color }) => (
                  <span key={label} className={`bg-white/70 px-3 py-1 rounded-full font-semibold border border-[#d6e8c0] ${color}`}>{label}</span>
                ))}
              </div>

              {mealDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-[#587A34]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#587A34] animate-spin" />
                  </div>
                  <p className="text-[#3a5220] text-sm font-semibold">Loading recipe details…</p>
                </div>
              ) : (
                <>
                  {selectedMeal.description && (
                    <p className="text-[#3a5220]/80 text-sm leading-relaxed border-l-2 border-[#587A34]/30 pl-3">
                      {selectedMeal.description}
                    </p>
                  )}

                  <div className="h-px bg-gradient-to-r from-transparent via-[#587A34]/20 to-transparent" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ingredients */}
                    <div className="rounded-xl p-4 bg-white/60 border border-[#d6e8c0]">
                      <h4 className="text-[#2d3f1a] font-bold text-sm mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#587A34]/15 flex items-center justify-center">
                          <i className="fas fa-shopping-basket text-[#587A34] text-[10px]" />
                        </span>
                        Ingredients
                      </h4>
                      <ul className="space-y-1.5">
                        {(selectedMeal.ingredients || []).map((ing, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#3a5220]/80 text-xs leading-relaxed">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#587A34]/50 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-xl p-4 bg-white/60 border border-[#d6e8c0]">
                      <h4 className="text-[#2d3f1a] font-bold text-sm mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#587A34]/15 flex items-center justify-center">
                          <i className="fas fa-list-ol text-[#587A34] text-[10px]" />
                        </span>
                        Instructions
                      </h4>
                      <ol className="space-y-2">
                        {(selectedMeal.instructions || []).map((inst, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed text-[#3a5220]/80">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-[#587A34] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                            {inst}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {selectedMeal.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMeal.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#587A34]/30 text-[#587A34] tracking-wide uppercase">{tag}</span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <button onClick={() => setSelectedMeal(null)} className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold text-[#587A34] border border-[#587A34]/30 hover:bg-[#587A34]/10 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanPage;