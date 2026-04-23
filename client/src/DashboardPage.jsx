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

const ErrorBanner = ({ message, detail, isRefusal, onClose }) => {
  if (!message) return null;

  const isAiRefusal = isRefusal === true;

  return (
    <div className="mx-4 md:mx-8 mb-5">
      <div className="rounded-2xl overflow-hidden shadow-md border border-red-200/60" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #ffe8e8 100%)' }}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #b91c1c, #ef4444, #fca5a5)' }} />
        <div className="px-5 py-4 flex items-start gap-4">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mt-0.5">
            <i className={`fas ${isAiRefusal ? 'fa-shield-alt' : 'fa-exclamation-triangle'} text-red-600 text-sm`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-red-900 text-sm mb-0.5">
              {isAiRefusal ? message : "Something went wrong"}
            </p>
            {!isAiRefusal && <p className="text-red-700 text-sm leading-relaxed">{message}</p>}
            {isAiRefusal && detail && detail !== message && <p className="text-red-700 text-sm leading-relaxed mt-1">{detail}</p>}
            {isAiRefusal && (
              <p className="mt-2 text-xs text-red-500/80 italic">
                Try asking about a dish, ingredient, or cuisine instead.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors cursor-pointer mt-0.5"
          >
            <i className="fas fa-times text-red-500 text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
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

const LoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const loadingMessages = [
    "Setting up your kitchen",
    "Loading your preferences",
    "Getting everything ready",
    "Almost there",
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#B5D098] flex items-center justify-center z-50">
      <div className="relative z-10 backdrop-blur-2xl bg-white/5 rounded-3xl px-10 py-8 shadow-2xl border border-white/30">
        <div className="text-center">
          <div className="mb-8">
            <div className="font-lemon font-bold text-4xl tracking-tight">
              <span className="text-[#1B211A] drop-shadow-sm">Dish</span>
              <span className="text-[#839705] drop-shadow-sm">covery</span>
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#839705] to-transparent mx-auto mt-3" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-3 h-3 bg-[#32491B] rounded-full animate-glass-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-[#32491B] rounded-full animate-glass-pulse" style={{ animationDelay: '0.15s' }} />
            <div className="w-3 h-3 bg-[#32491B] rounded-full animate-glass-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
          <p className="text-[#1B211A] text-sm font-medium tracking-wide transition-all duration-300">
            {loadingMessages[messageIndex]}
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes glass-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; box-shadow: 0 0 0 0 rgba(50, 73, 27, 0); }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 0 4px rgba(50, 73, 27, 0.2); }
        }
        .animate-glass-pulse { animation: glass-pulse 1.5s ease-in-out infinite; }
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
  const [generateErrorDetail, setGenerateErrorDetail] = useState("");
  const [isAiRefusalError, setIsAiRefusalError] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [lastPromptText, setLastPromptText] = useState("");
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!accessToken && !refreshToken) {
          setShowFirstTimeModal(false);
          setIsChecking(false);
          return;
        }
        const response = await apiCall("/api/profiles");
        const profiles = Array.isArray(response?.data) ? response.data : [];
        if (profiles.length === 0) {
          setShowFirstTimeModal(true);
        } else {
          setShowFirstTimeModal(false);
          const active = profiles.find(p => p.is_default === true) || profiles.find(p => p.is_active === true);
          if (active) {
            setActiveProfile({ id: active.id, name: active.name, avatar: active.avatar_url });
          }
        }
      } catch {
        setShowFirstTimeModal(false);
      } finally {
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
      } catch {}
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
    estimatedCostPhp: suggestion?.estimatedCostPhp ?? null,
    difficulty: "Medium",
    tags: Array.isArray(suggestion?.keyIngredients) && suggestion.keyIngredients.length > 0
      ? ["ai", "generated", "recipe"]
      : ["ai", "generated"],
    ingredients: Array.isArray(suggestion?.keyIngredients) ? suggestion.keyIngredients : [],
    instructions: Array.isArray(suggestion?.instructions) ? suggestion.instructions : [],
    nutritionalInfo: suggestion?.nutritionalInfo ?? null,
  });

  const saveToHistory = async (card, promptText) => {
    try {
      await apiCall("/api/history", {
        method: "POST",
        body: JSON.stringify({
          search_query: promptText || card.title,
          recipe_id: typeof card.id === 'number' ? card.id : null,
          source_api: "gemini-2.5-flash",
          source: "recipe-generation",
          profile_id: activeProfile?.id ?? null,
          output_response: {
            suggestions: [{
              title: card.title,
              description: card.description,
              servings: card.servings,
              keyIngredients: card.ingredients,
              instructions: card.instructions,
            }],
            estimatedTime: card.prepTime,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const handleGenerateWithOptions = async (promptText, history, numOptions = 3) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 2000 && lastRequestTime !== 0) {
      setGenerateError(`Please wait ${Math.ceil((2000 - timeSinceLastRequest) / 1000)} seconds between requests.`);
      setGenerateErrorDetail("");
      setIsAiRefusalError(false);
      return;
    }

    try {
      setIsGenerating(true);
      setGenerateError("");
      setLastRequestTime(now);
      setLastPromptText(promptText);
      setShowOptions(false);
      setRecipeOptions([]);

      const response = await apiCall("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          profiles: activeProfile ? [activeProfile] : [],
          promptText,
          history: history || [],
          numOptions,
        }),
      });

      const recipeResponse = response?.response;

      if (Array.isArray(recipeResponse?.suggestions) && recipeResponse.suggestions.length > 0) {
        const cards = recipeResponse.suggestions.map((suggestion, index) =>
          mapSuggestionToCard(suggestion, recipeResponse?.estimatedTime, suggestion?.id ?? `suggestion-${index}`)
        );

        if (cards.length > 1) {
          setRecipeOptions(cards);
          setShowOptions(true);
          setGeneratedRecipe(null);
          setAiResponse(null);
        } else {
          setGeneratedRecipe(cards[0]);
          setAiResponse({ headline: cards[0].title, summary: cards[0].description });
          saveToHistory(cards[0], promptText);
        }
      } else {
        const hasAiError = recipeResponse?.error && String(recipeResponse.error).trim().toLowerCase() !== 'null';
        if (hasAiError) {
          setGenerateError(recipeResponse.header || "Invalid request");
          setGenerateErrorDetail(recipeResponse.error || "");
          setIsAiRefusalError(true);
          setGeneratedRecipe(null);
          setAiResponse(null);
          setShowOptions(false);
        } else {
          throw new Error("No recipe options were returned.");
        }
      }
    } catch (error) {
      if (error.message?.includes("503") || error.message?.includes("high demand") || error.message?.includes("UNAVAILABLE")) {
        setGenerateError("Gemini is currently busy. Please wait a few seconds and try again.");
      } else {
        setGenerateError(error.message || "Failed to generate recipe.");
      }
      setGenerateErrorDetail("");
      setIsAiRefusalError(false);
      setGeneratedRecipe(null);
      setAiResponse(null);
      setShowOptions(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (selected) => {
    setGeneratedRecipe(selected);
    setAiResponse({
      headline: selected.title,
      summary: selected.description || "You selected this recipe! Ask a follow-up to refine it further.",
    });
    setShowOptions(false);
    setRecipeOptions([]);
    saveToHistory(selected, lastPromptText);
  };

  const handleGenerateRecipe = async (promptText, history) => {
    await handleGenerateWithOptions(promptText, history, 3);
  };

  const handleResetRecipe = () => {
    setAiResponse(null);
    setGeneratedRecipe(null);
    setGenerateError("");
    setGenerateErrorDetail("");
    setIsAiRefusalError(false);
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
            <ErrorBanner message={generateError} detail={generateErrorDetail} isRefusal={isAiRefusalError} onClose={() => { setGenerateError(""); setGenerateErrorDetail(""); setIsAiRefusalError(false); }} />
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
        return <MealPlanPage onViewRecipe={setSelectedRecipe} activeProfile={activeProfile} />;
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
      } catch {}
      navigate("/", { replace: true });
    }
  };

  if (isChecking) return <LoadingScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#B5D098]">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={() => setShowLogoutConfirm(true)}
      />
      <main style={{ marginLeft: sidebarOpen ? '18rem' : '0' }} className="flex-1 h-screen overflow-y-auto transition-all duration-300">
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

      {showFirstTimeModal && (
        <FirsttimeModal onClose={handleFirstTimeModalClose} />
      )}

      {(showLogoutConfirm || isLoggingOut) && (
        <LogoutConfirmModal
          onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
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