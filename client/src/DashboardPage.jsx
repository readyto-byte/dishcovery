import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiCall } from "./api/config.js";
import Sidebar from "./components/Dashboard/Sidebar";
import DashboardNavbar from "./components/Dashboard/DashboardNavbar";
import WelcomeBanner from "./components/Dashboard/WelcomeBanner";
import CreateRecipeSection from "./components/Dashboard/CreateRecipeSection";
import RecipeCard from "./components/Dashboard/RecipeCard";
import HistoryPage from "./components/Dashboard/HistoryPage";
import ProfilePage from "./components/Dashboard/ProfilePage";
import SettingsPage from "./components/Dashboard/SettingsPage";
import FavoritesPage from "./components/Dashboard/FavoritesPage";

const getRecipeErrorMessage = (error) => {
  const fallback = "Failed to generate recipe. Please try again.";
  const rawMessage = typeof error?.message === "string" ? error.message : "";
  const parseErrorPayload = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return null;
    try { return JSON.parse(value); } catch { return null; }
  };
  const parsed = parseErrorPayload(rawMessage);
  const errorPayload = parsed?.error || parsed;
  const serviceMessage =
    errorPayload?.message ||
    parsed?.message ||
    (typeof rawMessage === "string" ? rawMessage : "");
  const status = errorPayload?.status || parsed?.status || "";
  if (status === "UNAVAILABLE" || /high demand|try again later|UNAVAILABLE/i.test(serviceMessage)) {
    return "Dishcovery AI is busy right now. Please try again in a moment.";
  }
  if (serviceMessage && serviceMessage.trim().length > 0) return serviceMessage;
  return fallback;
};

// ── Recipe Detail Modal ───────────────────────────────────────────────────────
const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />

          <div className="px-7 pt-6 pb-4 shrink-0" style={{ background: 'linear-gradient(135deg, #32491B 0%, #587A34 100%)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B5D098]/30 text-[#B5D098] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {recipe.type}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    recipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300'
                    : recipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <h2 className="text-[#F0E6D1] font-extrabold text-xl md:text-2xl leading-tight">{recipe.title}</h2>
                <div className="flex gap-4 mt-3 text-[#B5D098] text-sm">
                  <span><i className="far fa-clock mr-1"></i>{recipe.time}</span>
                  <span><i className="fas fa-users mr-1"></i>{recipe.servings} servings</span>
                  {recipe.viewed && <span><i className="far fa-eye mr-1"></i>Viewed {recipe.viewed}</span>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F0E6D1] transition-all cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="bg-[#B5D098]/20 text-[#B5D098] px-2 py-0.5 rounded-full text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">
            {recipe.description && (
              <p className="text-[#4a5e30] text-sm leading-relaxed italic border-l-4 border-[#B5D098] pl-4">
                {recipe.description}
              </p>
            )}
            <div>
              <h3 className="text-[#32491B] font-bold text-base mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#32491B] flex items-center justify-center">
                  <i className="fas fa-list text-[#F0E6D1] text-xs"></i>
                </div>
                Ingredients
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#2d3f1a]">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#839705] shrink-0"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent" />
            <div>
              <h3 className="text-[#32491B] font-bold text-base mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#32491B] flex items-center justify-center">
                  <i className="fas fa-tasks text-[#F0E6D1] text-xs"></i>
                </div>
                Instructions
              </h3>
              <ol className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#2d3f1a]">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#32491B] text-[#F0E6D1] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="px-7 py-4 shrink-0 border-t border-[#B5D098]/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Logout Confirm Modal ──────────────────────────────────────────────────────
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
              : <>Are you sure you want to log out of <span className="font-semibold text-[#32491B]">Dishcovery</span>?</>}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              Stay
            </button>
            <button onClick={onConfirm} disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm tracking-wide transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);

// ── Dashboard Page ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recipeError, setRecipeError] = useState("");
  const [selectedHistoryRecipe, setSelectedHistoryRecipe] = useState(null);
  const [recipeData, setRecipeData] = useState({
    title: "Strawberries with Yogurt and Honey",
    description: "This refreshing dish combines sweet strawberries with creamy yogurt and honey for a delightful treat.",
    prepTime: "10 min",
    cookTime: "0 min",
    servings: "2",
    difficulty: "easy",
    tags: ["dessert", "healthy", "quick", "fresh"],
    ingredients: [
      "2 cups fresh strawberries, hulled and sliced",
      "1 cup plain yogurt (Greek or regular)",
      "2 tablespoons honey",
      "1 teaspoon vanilla extract",
      "1 tablespoon chopped mint (optional)"
    ],
    instructions: [
      "Wash and slice the strawberries.",
      "In a bowl, mix yogurt, honey, and vanilla extract.",
      "Add sliced strawberries and gently fold.",
      "Garnish with mint if desired.",
      "Serve immediately or chill for 15 minutes."
    ]
  });

  const generateRecipe = async (userInput) => {
    setIsLoading(true);
    setRecipeError("");
    try {
      const profilesResponse = await apiCall("/api/profiles");
      const profiles = Array.isArray(profilesResponse?.data) ? profilesResponse.data : [];
      const selectedProfile =
        profiles.find((profile) => profile?.is_active) ||
        profiles[0] ||
        null;

      if (!selectedProfile) {
        throw new Error("No profile found. Please create and select a profile first.");
      }

      const response = await apiCall("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          profiles: [
            {
              id: selectedProfile.id,
              name: selectedProfile.name,
              dietary_restrictions: Array.isArray(selectedProfile.dietary_restrictions)
                ? selectedProfile.dietary_restrictions : [],
              dietary_preferences: Array.isArray(selectedProfile.dietary_preferences)
                ? selectedProfile.dietary_preferences : [],
            },
          ],
          conversation: [{ role: "user", content: userInput }],
          searchQuery: userInput,
        }),
      });
      const suggestions = response?.response?.suggestions;
      const suggestion = Array.isArray(suggestions) && suggestions.length > 0 ? suggestions[0] : null;
      if (!suggestion) throw new Error("Gemini returned no recipe suggestions.");
      const totalTimeFromApi = response?.response?.estimatedTime;
      const prepFromApi = suggestion.prepTimeMin ?? suggestion.prep_time_min;
      const cookFromApi = suggestion.cookTimeMin ?? suggestion.cook_time_min;
      setRecipeData({
        title: suggestion.title || "Generated Recipe",
        description: suggestion.description || response?.response?.message || "Generated by Gemini.",
        prepTime: prepFromApi ? `${prepFromApi} min` : totalTimeFromApi || "15 min",
        cookTime: cookFromApi ? `${cookFromApi} min` : "20 min",
        servings: suggestion.servings ? String(suggestion.servings) : "2",
        difficulty: "medium",
        tags: ["gemini ai", "personalized", "recommended"],
        ingredients: Array.isArray(suggestion.keyIngredients) ? suggestion.keyIngredients : [],
        instructions: Array.isArray(suggestion.instructions) ? suggestion.instructions : [],
      });
    } catch (error) {
      setRecipeError(getRecipeErrorMessage(error));
    } finally {
      setHasGenerated(true);
      setIsLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <WelcomeBanner />
            {recipeError && (
              <div className="mx-4 md:mx-8 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {recipeError}
              </div>
            )}
            <CreateRecipeSection onGenerate={generateRecipe} isLoading={isLoading} />
            {(hasGenerated || isLoading) && (
              <RecipeCard recipeData={recipeData} isLoading={isLoading} />
            )}
          </>
        );
      case 'history':
        return <HistoryPage onViewRecipe={setSelectedHistoryRecipe} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'favorites':
        return <FavoritesPage />;
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

      <main
        style={{ marginLeft: sidebarOpen ? '18rem' : '0' }}
        className="transition-all duration-300"
      >
        <DashboardNavbar
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="pb-12">{renderPage()}</div>
      </main>

      {/* ── Modals live OUTSIDE <main> so z-index is never clipped ── */}
      {selectedHistoryRecipe && (
        <RecipeDetailModal
          recipe={selectedHistoryRecipe}
          onClose={() => setSelectedHistoryRecipe(null)}
        />
      )}

      {(showLogoutConfirm || isLoggingOut) && (
        <LogoutConfirmModal
          onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
          isLoggingOut={isLoggingOut}
        />
      )}
    </div>
  );
};

export default DashboardPage;