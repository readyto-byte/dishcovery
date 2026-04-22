import { useState, useEffect } from "react";
import { RotateCcw, Apple, Droplet, ShoppingBag, Clock, ChefHat, Heart, Activity, Ruler, Weight, Calendar, Flame, Coffee, Sun, Moon, AlertCircle, CheckCircle2, Utensils, Target, PlusCircle } from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";
import {
  buildGeneratedPlanFromPreferences,
  mapDbRowToFormData,
  formatMealPlanCreatedAt,
} from "../../mealPlanGeneration";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"];

const defaultPlan = () =>
  Object.fromEntries(DAYS.map((day) => [day, Object.fromEntries(MEAL_SLOTS.map((slot) => [slot, null]))]));

const MealPlanPage = ({ onViewRecipe }) => {
  const [plan, setPlan] = useState(defaultPlan());
  const [activeSlot, setActiveSlot] = useState(null);
  const [inputValue, setInputValue] = useState("");
  
  // State for the meal planner form
  const [formData, setFormData] = useState({
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
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [mealPlanSaveError, setMealPlanSaveError] = useState(null);
  const [mealPlanSaveOk, setMealPlanSaveOk] = useState(false);
  const [mealPlanSaving, setMealPlanSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrating(true);
      try {
        const res = await apiCall("/api/meal-plans/active");
        if (cancelled) return;
        const row = res?.data;
        if (row) {
          const form = mapDbRowToFormData(row);
          if (form) {
            const gen = buildGeneratedPlanFromPreferences(form, row.created_at);
            setFormData(form);
            setGeneratedPlan(gen);
            setShowForm(false);
          }
        }
      } catch {
        /* not signed in or network */
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        [equipment]: !prev.kitchenEquipment[equipment]
      }
    }));
  };

  const resetForm = () => {
    setFormData({
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
  };

  const generateMealPlan = async () => {
    const snapshot = { ...formData };
    const built = buildGeneratedPlanFromPreferences(snapshot);
    setGeneratedPlan(built);

    setShowForm(false);
    setMealPlanSaveError(null);
    setMealPlanSaveOk(false);
    setMealPlanSaving(true);
    try {
      const res = await apiCall("/api/meal-plans", {
        method: "POST",
        body: JSON.stringify(snapshot),
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
    }
  };

  const handleNewMealPlan = async () => {
    try {
      await apiCall("/api/meal-plans/deactivate-active", { method: "POST", body: "{}" });
    } catch {
      /* still open a fresh form */
    }
    resetForm();
    setGeneratedPlan(null);
    setShowForm(true);
    setMealPlanSaveError(null);
    setMealPlanSaveOk(false);
    setMealPlanSaving(false);
  };

  if (hydrating) {
    return (
      <div className="pb-12 flex justify-center items-center min-h-[280px] mx-4 md:mx-8">
        <p className="text-[#32491B] text-sm font-semibold bg-white/80 px-5 py-3 rounded-xl shadow border border-[#B5D098]/40">
          Loading your meal plan…
        </p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl">
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-2xl"
          style={{ 
            backgroundImage: `url(${heroBg})`,
            filter: "brightness(0.7)"
          }}
        />
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-5 z-10">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              Meal <span className="text-[#B5D098]">Plan</span>
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">
              Make your meal plans more personalized.
            </p>
          </div>
          {showForm && (
            <button
              onClick={() => setPlan(defaultPlan())}
              className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Personalized Meal Planner Form - Only shows when showForm is true */}
      {showForm && (
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
              <h2 className="text-white font-bold text-xl">Personalized Meal Planner</h2>
              <p className="text-[#B5D098] text-sm">Tell us about yourself and we'll create a custom meal plan</p>
            </div>
            
            <div className="p-6">
              {/* Two column grid for form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                    placeholder="e.g., 25"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Height */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleFormChange}
                    placeholder="e.g., 170 cm or 5'7 in"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Goal */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Goal</label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Weight loss">Weight loss</option>
                    <option value="Muscle gain">Muscle gain</option>
                    <option value="Maintain weight">Maintain weight</option>
                    <option value="Improve energy">Improve energy</option>
                    <option value="Better digestion">Better digestion</option>
                  </select>
                </div>
                
                {/* Food Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Food Budget</label>
                  <select
                    name="foodBudget"
                    value={formData.foodBudget}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Low ($ - under $50/week)">Low ($ - under $50/week)</option>
                    <option value="Medium ($$ - $50-$100/week)">Medium ($$ - $50-$100/week)</option>
                    <option value="High ($$$ - $100+/week)">High ($$$ - $100+/week)</option>
                  </select>
                </div>
                
                {/* Max Cooking Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Cooking Time</label>
                  <select
                    name="maxCookingTime"
                    value={formData.maxCookingTime}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour+">1 hour+</option>
                  </select>
                </div>
                
                {/* Carb Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Carb Preference</label>
                  <select
                    name="carbPreference"
                    value={formData.carbPreference}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Low Carb">Low Carb</option>
                    <option value="Moderate Carb">Moderate Carb</option>
                    <option value="High Carb">High Carb</option>
                    <option value="Keto friendly">Keto friendly</option>
                  </select>
                </div>
                
                {/* Kitchen Equipment */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kitchen Equipment Available</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.kitchenEquipment.stove}
                        onChange={() => handleKitchenEquipmentChange("stove")}
                        className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                      />
                      <span className="text-gray-700">Stove</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.kitchenEquipment.microwave}
                        onChange={() => handleKitchenEquipmentChange("microwave")}
                        className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                      />
                      <span className="text-gray-700">Microwave</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.kitchenEquipment.airFryer}
                        onChange={() => handleKitchenEquipmentChange("airFryer")}
                        className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                      />
                      <span className="text-gray-700">Air fryer</span>
                    </label>
                  </div>
                </div>
                
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Allergies (if any)</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleFormChange}
                    placeholder="e.g., Nuts, Dairy, Seafood"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Medical Conditions (if any)</label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleFormChange}
                    placeholder="e.g., Diabetes, Hypertension"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Sex/Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sex/Gender</label>
                  <select
                    name="sexGender"
                    value={formData.sexGender}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                
                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    placeholder="e.g., 70 kg or 154 lbs"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Sedentary">Sedentary (little or no exercise)</option>
                    <option value="Lightly active">Lightly active (1-3 days/week)</option>
                    <option value="Moderately active">Moderately active (3-5 days/week)</option>
                    <option value="Very active">Very active (6-7 days/week)</option>
                    <option value="Extra active">Extra active (physical job + training)</option>
                  </select>
                </div>
                
                {/* Preferred Cuisine */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Cuisine</label>
                  <select
                    name="preferredCuisine"
                    value={formData.preferredCuisine}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Asian">Asian</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Indian">Indian</option>
                    <option value="American">American</option>
                  </select>
                </div>
                
                {/* Cooking Skill Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cooking Skill Level</label>
                  <select
                    name="cookingSkillLevel"
                    value={formData.cookingSkillLevel}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Beginner">Beginner (minimal experience)</option>
                    <option value="Intermediate">Intermediate (comfortable with recipes)</option>
                    <option value="Advanced">Advanced (confident cook)</option>
                  </select>
                </div>
                
                {/* Fat Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fat Preference</label>
                  <select
                    name="fatPreference"
                    value={formData.fatPreference}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  >
                    <option value="">Select...</option>
                    <option value="Low Fat">Low Fat</option>
                    <option value="Moderate Healthy Fats">Moderate Healthy Fats</option>
                    <option value="Higher Fat (Keto style)">Higher Fat (Keto style)</option>
                  </select>
                </div>
                
                {/* Foods You Dislike */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Foods You Dislike</label>
                  <input
                    type="text"
                    name="foodsDislike"
                    value={formData.foodsDislike}
                    onChange={handleFormChange}
                    placeholder="e.g., Ampalaya, Onion"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
                
                {/* Meal Schedule */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Meal Schedule</label>
                  <input
                    type="text"
                    name="mealSchedule"
                    value={formData.mealSchedule}
                    onChange={handleFormChange}
                    placeholder="e.g., 7AM, 12PM, 7PM"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#587A34] focus:ring-1 focus:ring-[#587A34] transition"
                  />
                </div>
              </div>
              
              {/* Additional Options */}
              <div className="mt-6 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeWaterGoal"
                    checked={formData.includeWaterGoal}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                  />
                  <span className="text-gray-700 font-medium">Include water goal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeSnacks"
                    checked={formData.includeSnacks}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                  />
                  <span className="text-gray-700 font-medium">Include snacks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="generateGroceryList"
                    checked={formData.generateGroceryList}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#587A34] focus:ring-[#587A34]"
                  />
                  <span className="text-gray-700 font-medium">Generate grocery list</span>
                </label>
              </div>
              
              {/* Generate Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={generateMealPlan}
                  className="bg-[#587A34] hover:bg-[#3c5a23] text-white font-bold py-3.5 px-10 rounded-xl shadow-md transition-all text-lg flex items-center gap-2"
                >
                  <Utensils className="w-5 h-5" />
                  Generate My Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Generated Meal Plan Card - Only shows when generatedPlan exists and form is hidden */}
      {!showForm && generatedPlan && (
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#1e3a0f] to-[#2b4b1a]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                    <Apple className="w-6 h-6 text-[#B5D098]" />
                    Your Personalized Meal Plan
                  </h2>
                  <p className="text-[#B5D098] text-sm mt-1">Generated on {generatedPlan.createdAt}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {mealPlanSaving && (
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  Saving your preferences…
                </p>
              )}
              {mealPlanSaveOk && !mealPlanSaving && (
                <p className="text-sm text-[#32491B] bg-[#e8f2dc] border border-[#B5D098]/50 rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Your meal plan preferences were saved to your account.
                </p>
              )}
              {mealPlanSaveError && (
                <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {mealPlanSaveError}
                </p>
              )}
              {/* Profile Summary Card */}
              <div className="bg-[#f5f9ef] rounded-xl p-5 border border-[#B5D098]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#587A34]/10 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#587A34]" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Your Profile Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Age: <span className="font-semibold">{generatedPlan.age || "—"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Height: <span className="font-semibold">{generatedPlan.height || "—"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Weight: <span className="font-semibold">{generatedPlan.weight || "—"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Goal: <span className="font-semibold">{generatedPlan.goal || "Not specified"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Activity: <span className="font-semibold">{generatedPlan.activityLevel || "Not specified"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Cuisine: <span className="font-semibold">{generatedPlan.preferredCuisine || "Not specified"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Cooking Time: <span className="font-semibold">{generatedPlan.maxCookingTime || "Not specified"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#587A34]" />
                    <span className="text-sm text-gray-600">Skill Level: <span className="font-semibold">{generatedPlan.cookingSkillLevel || "Not specified"}</span></span>
                  </div>
                </div>
                
                {/* Health Notes */}
                {(generatedPlan.allergies || generatedPlan.medicalConditions || generatedPlan.foodsDislike) && (
                  <div className="mt-4 pt-3 border-t border-[#B5D098]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-gray-700 text-sm">Health Notes</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {generatedPlan.allergies && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Allergies:</span>
                          <span className="text-red-600 font-medium">{generatedPlan.allergies}</span>
                        </div>
                      )}
                      {generatedPlan.medicalConditions && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Medical:</span>
                          <span className="text-amber-600 font-medium">{generatedPlan.medicalConditions}</span>
                        </div>
                      )}
                      {generatedPlan.foodsDislike && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Avoid:</span>
                          <span className="text-red-600 font-medium">{generatedPlan.foodsDislike}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Daily Meal Plan */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#587A34]/10 rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-[#587A34]" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Daily Meal Plan</h3>
                  {generatedPlan.mealSchedule && (
                    <span className="text-sm text-gray-500 ml-2">({generatedPlan.mealSchedule})</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Breakfast */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Coffee className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-gray-800">Breakfast</h4>
                    </div>
                    <p className="font-medium text-gray-800">{generatedPlan.meals.breakfast.title}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <span className="bg-white px-2 py-1 rounded-full text-amber-700">{generatedPlan.meals.breakfast.calories} cal</span>
                      <span className="bg-white px-2 py-1 rounded-full text-blue-700">{generatedPlan.meals.breakfast.protein}g protein</span>
                      <span className="bg-white px-2 py-1 rounded-full text-green-700">{generatedPlan.meals.breakfast.carbs}g carbs</span>
                      <span className="bg-white px-2 py-1 rounded-full text-orange-700">{generatedPlan.meals.breakfast.fats}g fats</span>
                    </div>
                  </div>
                  
                  {/* Lunch */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-gray-800">Lunch</h4>
                    </div>
                    <p className="font-medium text-gray-800">{generatedPlan.meals.lunch.title}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <span className="bg-white px-2 py-1 rounded-full text-amber-700">{generatedPlan.meals.lunch.calories} cal</span>
                      <span className="bg-white px-2 py-1 rounded-full text-blue-700">{generatedPlan.meals.lunch.protein}g protein</span>
                      <span className="bg-white px-2 py-1 rounded-full text-green-700">{generatedPlan.meals.lunch.carbs}g carbs</span>
                      <span className="bg-white px-2 py-1 rounded-full text-orange-700">{generatedPlan.meals.lunch.fats}g fats</span>
                    </div>
                  </div>
                  
                  {/* Dinner */}
                  <div className="bg-[#E6F0DA] rounded-xl p-4 border border-[#B5D098]">
                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-5 h-5 text-[#587A34]" />
                      <h4 className="font-bold text-gray-800">Dinner</h4>
                    </div>
                    <p className="font-medium text-gray-800">{generatedPlan.meals.dinner.title}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <span className="bg-white px-2 py-1 rounded-full text-amber-700">{generatedPlan.meals.dinner.calories} cal</span>
                      <span className="bg-white px-2 py-1 rounded-full text-blue-700">{generatedPlan.meals.dinner.protein}g protein</span>
                      <span className="bg-white px-2 py-1 rounded-full text-green-700">{generatedPlan.meals.dinner.carbs}g carbs</span>
                      <span className="bg-white px-2 py-1 rounded-full text-orange-700">{generatedPlan.meals.dinner.fats}g fats</span>
                    </div>
                  </div>
                </div>
                
                {/* Total Daily Nutrition */}
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
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-gray-600">Carbs: <span className="font-medium">{generatedPlan.carbPreference || "Moderate"}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-gray-600">Fats: <span className="font-medium">{generatedPlan.fatPreference || "Moderate"}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-gray-600">Budget: <span className="font-medium">{generatedPlan.foodBudget || "Not specified"}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-gray-600">Equipment: <span className="font-medium">
                      {Object.entries(generatedPlan.kitchenEquipment).filter(([_, v]) => v).map(([k]) => k).join(", ") || "None specified"}
                    </span></span>
                  </div>
                </div>
              </div>
              
              {/* Snacks */}
              {generatedPlan.includeSnacks && generatedPlan.snacks.length > 0 && (
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
              {generatedPlan.generateGroceryList && generatedPlan.groceryList.length > 0 && (
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
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              {item}
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

              {/* Generate New Meal Plan Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleNewMealPlan}
                  className="bg-[#587A34] hover:bg-[#3c5a23] text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Generate New Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanPage;