import { useState, useEffect } from 'react';
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
import FirsttimeModal from "./components/Dashboard/FirsttimeModal";

const MEAL_PLAN_STORAGE_KEY = 'dishcovery_meal_plan';

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

const LoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const loadingMessages = [
    "Warming up the kitchen...",
    "Gathering fresh ingredients...",
    "Preparing your workspace...",
    "Checking your preferences...",
    "Almost ready to cook...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#B5D098] via-[#9bc47a] to-[#7da35c] flex items-center justify-center overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#587A34]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#32491B]/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#839705]/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-20 right-1/4 w-40 h-40 bg-[#F0E6D1]/10 rounded-full blur-2xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-60 h-60 bg-[#32491B]/20 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-float-slow opacity-20">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
            <path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-float opacity-30">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14z"/>
            <path d="M6 7h12v2H6zm0 4h12v2H6zm0 4h8v2H6z"/>
          </svg>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float-fast opacity-15">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
            <path d="M12 6v6l4 2-4 2v-6z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#32491B] to-[#587A34] flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white tracking-tight">D</span>
            </div>
          </div>
        </div>

        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#F0E6D1] border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '0.8s' }} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          Dishcovery
        </h2>
        <p className="text-white/90 font-medium text-lg mb-2">
          {loadingMessages[messageIndex]}
        </p>
        <p className="text-white/70 text-sm">
          Please wait while we set up your personalized experience
        </p>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === messageIndex 
                  ? 'w-6 h-2 bg-white' 
                  : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(8deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

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
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        console.log("=== FIRST TIME MODAL CHECK STARTED ===");
        console.log("Step 1: Checking for access token...");
        
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        console.log("Access token exists?", accessToken ? "YES" : "NO");
        console.log("Refresh token exists?", refreshToken ? "YES" : "NO");
        
        if (!accessToken && !refreshToken) {
          console.log("RESULT: No auth tokens found - user not logged in");
          console.log("NOT showing first time modal");
          setShowFirstTimeModal(false);
          setIsChecking(false);
          return;
        }
        
        console.log("Step 2: Auth tokens found, checking profiles from backend...");
        const response = await apiCall("/api/profiles");
        console.log("Profiles API response:", response);
        
        const profiles = Array.isArray(response?.data) ? response.data : [];
        console.log("Number of profiles found:", profiles.length);
        
        if (profiles.length === 0) {
          console.log("RESULT: No profiles found - SHOWING modal");
          setShowFirstTimeModal(true);
        } else {
          console.log("RESULT: User has profiles - NOT showing modal");
          setShowFirstTimeModal(false);

          const active = profiles.find(p => p.is_default === true) || profiles.find(p => p.is_active === true);
          if (active) {
            console.log("Setting active profile:", active.name);
            setActiveProfile({ id: active.id, name: active.name, avatar: active.avatar_url });
          }
        }
      } catch (error) {
        console.error("ERROR in first time check:", error);
        console.log("RESULT: Error occurred - NOT showing modal to be safe");
        setShowFirstTimeModal(false);
      } finally {
        console.log("=== FIRST TIME MODAL CHECK COMPLETED ===");
        setIsChecking(false);
      }
    };
    
    checkFirstTime();
  }, []);

  const handleActiveProfileChange = (profile) => {
    setActiveProfile(profile);
  };

  const handleFirstTimeModalClose = () => {
    setShowFirstTimeModal(false);

    setProfileRefreshKey(prev => prev + 1);

    const fetchActiveProfile = async () => {
      try {
        const response = await apiCall("/api/profiles");
        const profiles = Array.isArray(response?.data) ? response.data : [];

        const active = profiles.find(p => p.is_default === true) || profiles.find(p => p.is_active === true);
        if (active) {
          setActiveProfile({ id: active.id, name: active.name, avatar: active.avatar_url });
        }
      } catch (error) {
        console.error("Error fetching active profile:", error);
      }
    };
    fetchActiveProfile();
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
      } else if (Array.isArray(recipeResponse?.suggestions) && recipeResponse.suggestions.length > 0) {
        const cards = recipeResponse.suggestions.map((suggestion, index) =>
          mapSuggestionToCard(
            suggestion,
            recipeResponse?.estimatedTime,
            suggestion?.id ?? `suggestion-${index}`
          )
        );

        if (cards.length > 1) {
          setRecipeOptions(cards);
          setShowOptions(true);
          setGeneratedRecipe(null);
          setAiResponse(null);
        } else {
          setGeneratedRecipe(cards[0]);
          setAiResponse({
            headline: cards[0].title,
            summary: cards[0].description,
          });
        }
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
    console.log("User selected option:", selectedRecipe.title);
    setGeneratedRecipe(selectedRecipe);
    setAiResponse({
      headline: selectedRecipe.title,
      summary: selectedRecipe.description || "You selected this recipe! Ask a follow-up to refine it further.",
    });
    setShowOptions(false);
    setRecipeOptions([]);
  };

  const handleGenerateRecipe = async (promptText, history) => {
    await handleGenerateWithOptions(promptText, history, 3);
  };

  const handleResetRecipe = () => {
    console.log("Resetting recipe conversation");
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
            <WelcomeBanner activeProfile={activeProfile} />
            
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
        return <MealPlanPage 
          onViewRecipe={setSelectedRecipe} 
          activeProfile={activeProfile}
        />;
      case 'profile':
        return (
          <ProfilePage
            key={profileRefreshKey}
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
      try {
        localStorage.removeItem(MEAL_PLAN_STORAGE_KEY);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } catch {
      }
      navigate("/", { replace: true });
    }
  };

  if (isChecking) {
    return <LoadingScreen />;
  }

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

      {/* First Time Modal */}
      {showFirstTimeModal && (
        <FirsttimeModal onClose={handleFirstTimeModalClose} />
      )}

      {/* Logout Confirmation Modal */}
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

      {/* Recipe Details Modal */}
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