import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiCall } from "./api/config.js";
import Sidebar from "./components/Dashboard/Sidebar";
import DashboardNavbar from "./components/Dashboard/DashboardNavbar";
import WelcomeBanner from "./components/Dashboard/WelcomeBanner";
import CreateRecipeSection from "./components/Dashboard/CreateRecipeSection";
import RecipeCard from "./components/Dashboard/RecipeCard";
import RecipeOptionsGrid from "./components/Dashboard/RecipeOptionsGrid";
import MealPlanPage from "./components/Dashboard/MealPlanPage";
import HistoryPage from "./components/Dashboard/HistoryPage";
import ProfilePage from "./components/Dashboard/ProfilePage";
import SettingsPage from "./components/Dashboard/SettingsPage";
import FavoritesPage from "./components/Dashboard/FavoritesPage";

// ===== TEST MODE CONFIGURATION =====
const TEST_MODE = true; // Set to false to use real Gemini API
const USE_MOCK_OPTIONS = true; // Set to false to test single recipe mode
const MOCK_DELAY_MS = 1500; // Simulate network delay in milliseconds

// Mock data for testing multiple options
const MOCK_RECIPE_OPTIONS = [
  {
    id: 'mock-1',
    title: 'Classic Strawberry Cake',
    description: 'A traditional strawberry cake with fresh strawberries and cream cheese frosting. Perfect for birthdays and special occasions.',
    prepTime: '20 min',
    cookTime: '35 min',
    servings: 8,
    difficulty: 'Medium',
    tags: ['classic', 'birthday', 'dessert'],
    ingredients: ['2 cups all-purpose flour', '1 cup fresh strawberries (mashed)', '3 large eggs', '1 cup granulated sugar', '1/2 cup unsalted butter', '1 tsp vanilla extract', '2 tsp baking powder', '1/4 tsp salt'],
    instructions: [
      'Preheat oven to 350°F (175°C)',
      'Grease and flour a 9-inch cake pan',
      'Cream butter and sugar until light and fluffy',
      'Add eggs one at a time, beating well after each',
      'Mix in vanilla extract and mashed strawberries',
      'In separate bowl, whisk flour, baking powder, and salt',
      'Gradually add dry ingredients to wet mixture, mixing until just combined',
      'Pour batter into prepared pan and smooth the top',
      'Bake for 35 minutes or until toothpick comes out clean',
      'Let cool in pan for 10 minutes, then transfer to wire rack'
    ],
  },
  {
    id: 'mock-2',
    title: 'Gluten-Free Strawberry Cake',
    description: 'A delicious gluten-free version using almond flour. Moist, flavorful, and perfect for those with dietary restrictions.',
    prepTime: '15 min',
    cookTime: '30 min',
    servings: 6,
    difficulty: 'Easy',
    tags: ['gluten-free', 'healthy', 'almond'],
    ingredients: ['2 cups almond flour', '1 cup fresh strawberries (chopped)', '3 large eggs', '1/2 cup honey', '1/4 cup coconut oil (melted)', '1 tsp vanilla extract', '1 tsp baking soda', 'Pinch of salt'],
    instructions: [
      'Preheat oven to 350°F (175°C)',
      'Line an 8-inch cake pan with parchment paper',
      'In large bowl, whisk eggs, honey, coconut oil, and vanilla',
      'Add almond flour, baking soda, and salt, mix until combined',
      'Gently fold in chopped strawberries',
      'Pour batter into prepared pan',
      'Bake for 30 minutes until golden brown',
      'Cool completely before serving'
    ],
  },
  {
    id: 'mock-3',
    title: 'Vegan Strawberry Cake',
    description: 'Plant-based strawberry cake that\'s just as delicious as the original. Dairy-free and egg-free!',
    prepTime: '20 min',
    cookTime: '35 min',
    servings: 8,
    difficulty: 'Medium',
    tags: ['vegan', 'dairy-free', 'plant-based'],
    ingredients: ['2 cups all-purpose flour', '1 cup fresh strawberries (pureed)', '2 flax eggs (2 tbsp flaxseed meal + 6 tbsp water)', '3/4 cup coconut sugar', '1/2 cup coconut oil', '1 cup plant-based milk (almond or oat)', '1 tbsp baking powder', '1 tsp vanilla extract'],
    instructions: [
      'Preheat oven to 350°F (175°C)',
      'Prepare flax eggs and let sit for 5 minutes',
      'In large bowl, mix coconut oil and coconut sugar',
      'Add flax eggs, vanilla, and plant milk',
      'In separate bowl, whisk flour and baking powder',
      'Combine wet and dry ingredients, mix until just combined',
      'Fold in strawberry puree',
      'Pour into greased 9-inch cake pan',
      'Bake for 35 minutes',
      'Cool before frosting'
    ],
  },
];

// Mock data for single recipe (when USE_MOCK_OPTIONS is false)
const MOCK_SINGLE_RECIPE = {
  id: 'mock-single',
  title: 'Homemade Strawberry Cake',
  description: 'A delicious homemade strawberry cake made with fresh strawberries. Perfect for any celebration or weekend baking project.',
  prepTime: '20 min',
  cookTime: '35 min',
  servings: 8,
  difficulty: 'Medium',
  tags: ['dessert', 'birthday', 'homemade', 'strawberry'],
  ingredients: [
    '2 1/2 cups all-purpose flour',
    '1 1/2 cups fresh strawberries (mashed)',
    '3 large eggs (room temperature)',
    '1 3/4 cups granulated sugar',
    '1 cup unsalted butter (softened)',
    '1 tsp vanilla extract',
    '2 tsp baking powder',
    '1/2 tsp baking soda',
    '1/2 tsp salt',
    '1/2 cup buttermilk'
  ],
  instructions: [
    'Preheat oven to 350°F (175°C) and grease two 9-inch cake pans',
    'In a medium bowl, whisk together flour, baking powder, baking soda, and salt',
    'In a large bowl, cream butter and sugar until light and fluffy (about 3-4 minutes)',
    'Add eggs one at a time, beating well after each addition',
    'Mix in vanilla extract and mashed strawberries',
    'Alternately add dry ingredients and buttermilk, beginning and ending with dry ingredients',
    'Divide batter evenly between prepared pans',
    'Bake for 30-35 minutes or until toothpick comes out clean',
    'Cool in pans for 10 minutes, then transfer to wire racks to cool completely',
    'Frost with cream cheese frosting and garnish with fresh strawberries'
  ],
};

const RecipeDetailsModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-[#F0E6D1]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#32491B] text-[#F0E6D1]">
            <h2 className="text-xl font-bold">{recipe.title || "Recipe Details"}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all cursor-pointer"
              aria-label="Close recipe details"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-6 space-y-5 text-[#1B211A]">
            <p className="text-sm text-black/70">{recipe.description || "No description available."}</p>

            <div className="flex gap-4 text-sm text-black/70">
              <span><i className="far fa-clock mr-1"></i>{recipe.time || recipe.prepTime || "N/A"}</span>
              <span><i className="fas fa-users mr-1"></i>{recipe.servings || "-"}</span>
            </div>

            <div>
              <h3 className="font-semibold text-[#32491B] mb-2">Ingredients</h3>
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {recipe.ingredients.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-black/60">No ingredients listed.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-[#32491B] mb-2">Instructions</h3>
              {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  {recipe.instructions.map((step, index) => (
                    <li key={`${step}-${index}`}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-black/60">No instructions listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LogoutConfirmModal = ({ onConfirm, onCancel, isLoggingOut }) => (
  <>
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
      onClick={!isLoggingOut ? onCancel : undefined}
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />
        <div className="px-7 pt-7 pb-6">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#32491B]/10 flex items-center justify-center shadow-inner">
              {isLoggingOut ? (
                <svg className="animate-spin w-6 h-6 text-[#32491B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <i className="fas fa-sign-out-alt text-[#32491B] text-xl"></i>
              )}
            </div>
          </div>
          <h2 className="text-center font-bold text-[#1B211A] text-xl mb-2 tracking-tight">
            {isLoggingOut ? 'Logging out...' : 'Leaving so soon?'}
          </h2>
          <p className="text-center text-[#4a5e30] text-sm leading-relaxed mb-7">
            {isLoggingOut
              ? 'Please wait while we sign you out.'
              : <>Are you sure you want to log out of <span className="font-semibold text-[#32491B]">Dishcovery</span>?</>
            }
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Stay
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm tracking-wide transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const [activeProfile, setActiveProfile] = useState(null);

  const handleActiveProfileChange = (profile) => {
    setActiveProfile(profile);
  };

  const mapSuggestionToCard = (suggestion, fallbackEstimatedTime, recipeId) => ({
    id: recipeId,
    title: suggestion?.title || "Generated Recipe",
    description: suggestion?.description || "",
    prepTime: fallbackEstimatedTime || "N/A",
    cookTime: suggestion?.cookTimeMin ? `${suggestion.cookTimeMin} min` : "N/A",
    servings: suggestion?.servings || "-",
    difficulty: "Medium",
    tags: Array.isArray(suggestion?.keyIngredients) && suggestion.keyIngredients.length > 0
      ? ["ai", "generated", "recipe"]
      : ["ai", "generated"],
    ingredients: Array.isArray(suggestion?.keyIngredients) ? suggestion.keyIngredients : [],
    instructions: Array.isArray(suggestion?.instructions) ? suggestion.instructions : [],
  });

  const handleGenerateWithOptions = async (promptText, history, numOptions = 3) => {
    if (TEST_MODE) {
      console.log("🧪 TEST MODE: Using mock data instead of Gemini API");
      console.log("📝 User prompt:", promptText);
      console.log("📜 History length:", history?.length || 0);
      
      setIsGenerating(true);
      setGenerateError("");
      
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
      
      try {
        if (USE_MOCK_OPTIONS && numOptions > 1) {
          console.log("🎯 Returning multiple options (grid mode)");
          setRecipeOptions(MOCK_RECIPE_OPTIONS);
          setShowOptions(true);
          setGeneratedRecipe(null);
          setAiResponse(null);
        } else {
          console.log("🎯 Returning single recipe");
          setGeneratedRecipe(MOCK_SINGLE_RECIPE);
          setAiResponse({
            headline: MOCK_SINGLE_RECIPE.title,
            summary: MOCK_SINGLE_RECIPE.description,
          });
        }
        setGenerateError("");
      } catch (error) {
        setGenerateError("Mock mode error: " + error.message);
      } finally {
        setIsGenerating(false);
      }
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 2000 && lastRequestTime !== 0) {
      setGenerateError(`Please wait ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} seconds between requests.`);
      return;
    }
    
    try {
      setIsGenerating(true);
      setGenerateError("");
      setLastRequestTime(now);
      setShowOptions(false);
      setRecipeOptions([]);
      
      let finalPrompt = `Generate ${numOptions} different recipe variations for: "${promptText}".
      
Return the response as a JSON object with this exact structure:
{
  "options": [
    {
      "title": "Option 1 title",
      "description": "Brief description",
      "keyIngredients": ["ingredient1", "ingredient2"],
      "cookTimeMin": 30,
      "servings": 4,
      "instructions": ["step1", "step2"]
    }
  ]
}`;
      
      if (history && history.length > 0 && aiResponse) {
        finalPrompt = `Previous recipe context: "${aiResponse.headline}"
        
User request: Generate ${numOptions} variations for "${promptText}"

Please provide ${numOptions} different ways to modify/adapt the previous recipe.
Return as JSON with the structure above.`;
      }
      
      const response = await apiCall("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          profiles: activeProfile ? [activeProfile] : [],
          conversation: [{ role: "user", content: finalPrompt }],
        }),
      });

      const recipeResponse = response?.response;
      
      if (recipeResponse?.options && Array.isArray(recipeResponse.options)) {
        const options = recipeResponse.options.map((opt, index) => ({
          id: `option-${index}`,
          title: opt.title || `Option ${index + 1}`,
          description: opt.description || "",
          prepTime: opt.cookTimeMin ? `${opt.cookTimeMin} min` : "N/A",
          cookTime: opt.cookTimeMin ? `${opt.cookTimeMin} min` : "N/A",
          servings: opt.servings || "-",
          difficulty: ["Easy", "Medium", "Hard"][index % 3],
          tags: ["ai", "generated"],
          ingredients: Array.isArray(opt.keyIngredients) ? opt.keyIngredients : [],
          instructions: Array.isArray(opt.instructions) ? opt.instructions : [],
        }));
        
        if (options.length > 1) {
          setRecipeOptions(options);
          setShowOptions(true);
        } else if (options.length === 1) {
          setGeneratedRecipe(options[0]);
          setAiResponse({
            headline: options[0].title,
            summary: options[0].description,
          });
        }
      } else if (recipeResponse?.suggestions?.[0]) {
        const card = mapSuggestionToCard(
          recipeResponse.suggestions[0],
          recipeResponse?.estimatedTime,
          recipeResponse.suggestions[0]?.id ?? null
        );
        setGeneratedRecipe(card);
        setAiResponse({
          headline: card.title,
          summary: card.description,
        });
      } else {
        throw new Error("No recipe options were returned.");
      }
      
    } catch (error) {
      console.error("Recipe generation error:", error);
      
      if (error.message?.includes("503") || error.message?.includes("high demand") || error.message?.includes("UNAVAILABLE")) {
        setGenerateError("Gemini is currently busy. Please wait a few seconds and try again.");
      } else {
        setGenerateError(error.message || "Failed to generate recipe.");
      }
      setGeneratedRecipe(null);
      setAiResponse(null);
      setShowOptions(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (selectedRecipe) => {
    console.log("✅ User selected option:", selectedRecipe.title);
    setGeneratedRecipe(selectedRecipe);
    setAiResponse({
      headline: selectedRecipe.title,
      summary: selectedRecipe.description || "You selected this recipe! Ask a follow-up to refine it further.",
    });
    setShowOptions(false);
    setRecipeOptions([]);
  };

  const handleGenerateRecipe = async (promptText, history) => {
    // For test mode, always show options if USE_MOCK_OPTIONS is true
    const shouldShowOptions = TEST_MODE ? USE_MOCK_OPTIONS : true;
    await handleGenerateWithOptions(promptText, history, shouldShowOptions ? 3 : 1);
  };

  const handleResetRecipe = () => {
    console.log("🔄 Resetting recipe conversation");
    setAiResponse(null);
    setGeneratedRecipe(null);
    setGenerateError("");
    setShowOptions(false);
    setRecipeOptions([]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <WelcomeBanner />
            
            {/* Test Mode Indicator */}
            {TEST_MODE && (
              <div className="mx-4 md:mx-8 mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-700 flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <span>Test Mode Active - Using Mock Data (No API calls)</span>
                <span className="text-xs ml-auto opacity-70">Set TEST_MODE=false to use Gemini API</span>
              </div>
            )}
            
            <CreateRecipeSection 
              onGenerate={handleGenerateRecipe} 
              isLoading={isGenerating}
              aiResponse={aiResponse}
              onReset={handleResetRecipe}
            />
            
            {generateError && (
              <div className="mx-4 md:mx-8 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {generateError}
              </div>
            )}
            
            {showOptions && recipeOptions.length > 0 && (
              <RecipeOptionsGrid 
                options={recipeOptions}
                onSelectOption={handleSelectOption}
                isLoading={isGenerating}
              />
            )}
            
            {!showOptions && (isGenerating || generatedRecipe) && (
              <RecipeCard recipeData={generatedRecipe || {}} isLoading={isGenerating} />
            )}
          </>
        );
      case 'history':
        return <HistoryPage onViewRecipe={setSelectedRecipe} />;
      case 'meal-plan':
        return <MealPlanPage onViewRecipe={setSelectedRecipe} />;
      case 'profile':
        return (
          <ProfilePage
            activeProfile={activeProfile}
            onActiveProfileChange={handleActiveProfileChange}
          />
        );
      case 'settings':
        return <SettingsPage />;
      case 'favorites':
        return <FavoritesPage onViewRecipe={setSelectedRecipe} />;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#B5D098]">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={() => setShowLogoutConfirm(true)}
      />
      <main style={{ marginLeft: sidebarOpen ? '18rem' : '0' }} className="transition-all duration-300">
        <DashboardNavbar
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeProfile={activeProfile}
          onActiveProfileChange={handleActiveProfileChange}
        />
        <div className="pb-12">
          {renderPage()}
        </div>
      </main>

      {(showLogoutConfirm || isLoggingOut) && (
        <LogoutConfirmModal
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
          isLoggingOut={isLoggingOut}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailsModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;