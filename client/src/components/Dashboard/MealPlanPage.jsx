import { useState } from "react";
import { RotateCcw } from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";

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
  
  const [showResultModal, setShowResultModal] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

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

  const generateMealPlan = () => {
    // Create sample meal suggestions based on preferences
    const getMealSuggestions = () => {
      let breakfast = "";
      let lunch = "";
      let dinner = "";
      
      if (formData.goal === "Weight loss") {
        breakfast = "Greek yogurt with berries & chia seeds";
        lunch = "Grilled chicken salad with lemon vinaigrette";
        dinner = "Zucchini noodles with turkey meatballs";
      } else if (formData.goal === "Muscle gain") {
        breakfast = "Protein oats with peanut butter & banana";
        lunch = "Quinoa bowl with chickpeas, avocado & salmon";
        dinner = "Lean beef stir-fry with brown rice";
      } else if (formData.goal === "Maintain weight") {
        breakfast = "Avocado toast with poached egg";
        lunch = "Mediterranean grain bowl with hummus";
        dinner = "Baked salmon with roasted vegetables";
      } else {
        breakfast = "Smoothie bowl with granola";
        lunch = "Turkey and avocado wrap";
        dinner = "Chicken and vegetable stir-fry";
      }
      
      // Adjust based on cuisine preference
      if (formData.preferredCuisine === "Italian") {
        lunch = "Whole wheat pasta with pesto & chicken";
        dinner = "Minestrone soup with caprese salad";
      } else if (formData.preferredCuisine === "Mexican") {
        lunch = "Black bean tacos with salsa";
        dinner = "Chicken fajita bowl";
      } else if (formData.preferredCuisine === "Asian") {
        lunch = "Buddha bowl with edamame";
        dinner = "Stir-fried tofu with broccoli";
      } else if (formData.preferredCuisine === "Mediterranean") {
        lunch = "Greek salad with grilled chicken";
        dinner = "Lemon herb fish with quinoa";
      }
      
      return { breakfast, lunch, dinner };
    };
    
    const meals = getMealSuggestions();
    
    // Generate grocery list if selected
    let groceryList = [];
    if (formData.generateGroceryList) {
      groceryList = [
        "Lean protein (chicken, fish, eggs)",
        "Fresh vegetables (spinach, broccoli, bell peppers)",
        "Fresh fruits (berries, bananas, apples)",
        "Whole grains (quinoa, oats, brown rice)",
        "Healthy fats (avocado, olive oil, nuts)",
        "Dairy or alternatives (Greek yogurt, almond milk)",
      ];
      if (formData.allergies) {
        groceryList.push(`⚠️ Avoid: ${formData.allergies}`);
      }
    }
    
    // Generate water goal if selected
    let waterGoal = null;
    if (formData.includeWaterGoal) {
      const activityLevels = {
        "Sedentary": "2.5 liters",
        "Lightly active": "3.0 liters",
        "Moderately active": "3.5 liters",
        "Very active": "4.0 liters",
      };
      waterGoal = activityLevels[formData.activityLevel] || "3.0 liters";
    }
    
    setGeneratedPlan({
      ...formData,
      meals,
      groceryList,
      waterGoal,
      snacks: formData.includeSnacks ? ["Apple with peanut butter", "Greek yogurt", "Handful of almonds", "Hummus with veggies"] : [],
    });
    
    setShowResultModal(true);
  };

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
          <button
            onClick={() => setPlan(defaultPlan())}
            className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Personalized Meal Planner Form */}
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
                Generate My Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Result Modal */}
      {showResultModal && generatedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">✨ Your Personalized Meal Plan</h2>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Profile Summary */}
              <div className="bg-[#f5f9ef] p-4 rounded-xl">
                <p className="font-semibold text-[#32491B]">📋 Profile Summary</p>
                <p className="text-sm mt-1">
                  Age: {generatedPlan.age || "—"} | {generatedPlan.sexGender || "—"} | Weight: {generatedPlan.weight || "—"} | Height: {generatedPlan.height || "—"}
                </p>
                <p className="text-sm">Goal: {generatedPlan.goal || "Not specified"} | Activity: {generatedPlan.activityLevel || "Not specified"}</p>
                <p className="text-sm">Allergies: {generatedPlan.allergies || "None"} | Dislikes: {generatedPlan.foodsDislike || "None"}</p>
                <p className="text-sm">Meal Schedule: {generatedPlan.mealSchedule || "Flexible"}</p>
              </div>
              
              {/* Sample Daily Meal Plan */}
              <div>
                <p className="font-bold text-gray-800">🍽️ Sample Daily Meal Plan</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <span className="font-medium">Breakfast:</span> {generatedPlan.meals.breakfast}
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="font-medium">Lunch:</span> {generatedPlan.meals.lunch}
                  </div>
                  <div className="bg-[#E6F0DA] p-3 rounded-lg">
                    <span className="font-medium">Dinner:</span> {generatedPlan.meals.dinner}
                  </div>
                </div>
              </div>
              
              {/* Nutrition Notes */}
              <div className="bg-white border rounded-lg p-3">
                <p className="font-semibold">👨‍🍳 Personalized Nutrition Notes:</p>
                <p className="text-sm">✔️ Carb preference: {generatedPlan.carbPreference || "Not specified"}</p>
                <p className="text-sm">✔️ Fat preference: {generatedPlan.fatPreference || "Not specified"}</p>
                <p className="text-sm">✔️ Max cooking time: {generatedPlan.maxCookingTime || "Not specified"}</p>
                <p className="text-sm">✔️ Cuisine style: {generatedPlan.preferredCuisine || "Not specified"}</p>
              </div>
              
              {/* Snacks */}
              {generatedPlan.includeSnacks && (
                <div className="border-l-4 border-[#B5D098] pl-4">
                  <p className="font-semibold text-gray-700">🍎 Snack Recommendations</p>
                  <p className="text-gray-600">{generatedPlan.snacks.join(", ")}</p>
                </div>
              )}
              
              {/* Water Goal */}
              {generatedPlan.includeWaterGoal && (
                <div className="border-l-4 border-[#587A34] pl-4">
                  <p className="font-semibold text-gray-700">💧 Daily Water Goal</p>
                  <p className="text-gray-600">Aim for {generatedPlan.waterGoal} per day based on your activity level.</p>
                </div>
              )}
              
              {/* Grocery List */}
              {generatedPlan.generateGroceryList && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <p className="font-bold text-gray-800 flex items-center gap-2">🛒 Smart Grocery List</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 text-sm">
                    {generatedPlan.groceryList.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-xs text-gray-400 italic mt-2">
                *Plan generated dynamically based on your inputs. Adjust portions to meet your caloric needs.
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowResultModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium"
              >
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