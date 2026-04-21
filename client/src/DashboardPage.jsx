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
import FavoritesPage from "./components/Dashboard/FavoritesPage"; // ✅ ADD THIS IMPORT

const LogoutConfirmModal = ({ onConfirm, onCancel, isLoggingOut }) => (
  <>
    {/* Full-viewport backdrop with blur */}
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
      onClick={!isLoggingOut ? onCancel : undefined}
    />

    {/* Modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />

        <div className="px-7 pt-7 pb-6">
          {/* Icon — spinner when logging out */}
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

          {/* Text */}
          <h2 className="text-center font-bold text-[#1B211A] text-xl mb-2 tracking-tight">
            {isLoggingOut ? 'Logging out...' : 'Leaving so soon?'}
          </h2>
          <p className="text-center text-[#4a5e30] text-sm leading-relaxed mb-7">
            {isLoggingOut
              ? 'Please wait while we sign you out.'
              : <>Are you sure you want to log out of <span className="font-semibold text-[#32491B]">Dishcovery</span>?</>
            }
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />

          {/* Buttons */}
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
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recipeError, setRecipeError] = useState("");
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

      const response = await apiCall("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          profiles,
          conversation: [{ role: "user", content: userInput }],
          searchQuery: userInput,
        }),
      });

      const suggestions = response?.response?.suggestions;
      const suggestion = Array.isArray(suggestions) && suggestions.length > 0 ? suggestions[0] : null;
      if (!suggestion) {
        throw new Error("Gemini returned no recipe suggestions.");
      }

      const totalTimeFromApi = response?.response?.estimatedTime;
      const prepFromApi = suggestion.prepTimeMin ?? suggestion.prep_time_min;
      const cookFromApi = suggestion.cookTimeMin ?? suggestion.cook_time_min;

      const nextRecipe = {
        title: suggestion.title || "Generated Recipe",
        description: suggestion.description || response?.response?.message || "Generated by Gemini.",
        prepTime: prepFromApi ? `${prepFromApi} min` : totalTimeFromApi || "15 min",
        cookTime: cookFromApi ? `${cookFromApi} min` : "20 min",
        servings: suggestion.servings ? String(suggestion.servings) : "2",
        difficulty: "medium",
        tags: ["gemini ai", "personalized", "recommended"],
        ingredients: Array.isArray(suggestion.keyIngredients) ? suggestion.keyIngredients : [],
        instructions: Array.isArray(suggestion.instructions) ? suggestion.instructions : [],
      };

      setRecipeData(nextRecipe);
    } catch (error) {
      setRecipeError(error.message || "Failed to generate recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <>
            <WelcomeBanner />
            {recipeError ? (
              <div className="mx-4 md:mx-8 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {recipeError}
              </div>
            ) : null}
            <CreateRecipeSection onGenerate={generateRecipe} isLoading={isLoading} />
            <RecipeCard recipeData={recipeData} isLoading={isLoading} />
          </>
        );
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;   
      case 'settings':
        return <SettingsPage />;
      case 'favorites': // ✅ ADD THIS CASE
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
      <main style={{ marginLeft: sidebarOpen ? '18rem' : '0' }} className="transition-all duration-300">
        <DashboardNavbar 
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
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
    </div>
  );
};

export default DashboardPage;