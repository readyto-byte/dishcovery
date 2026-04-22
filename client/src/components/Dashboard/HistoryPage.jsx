import { useEffect, useState } from "react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

const RECIPES_PER_PAGE = 9;

// Consistent Loading Skeleton for History
const HistoryLoadingSkeleton = () => {
  return (
    <div className="pb-12">
      <style>{`
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .skeleton { background: linear-gradient(90deg, #e8f2dc 25%, #d4e9c0 50%, #e8f2dc 75%); background-size: 600px 100%; animation: shimmer 1.6s infinite linear; border-radius: 8px; }
      `}</style>
      
      {/* Hero skeleton */}
      <div className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl bg-[#1e3a0f]/80 px-8 py-7">
        <div className="space-y-2">
          <div className="skeleton h-8 w-40 opacity-30" />
          <div className="skeleton h-4 w-56 opacity-20" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mx-4 md:mx-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="h-12 bg-[#587A34] flex items-center justify-between px-4">
                <div className="skeleton h-6 w-20 opacity-30" />
                <div className="skeleton h-6 w-24 opacity-30" />
              </div>
              <div className="p-5 space-y-3">
                <div className="skeleton h-6 w-3/4 opacity-30" />
                <div className="skeleton h-4 w-1/2 opacity-20" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 opacity-20" />
                  <div className="skeleton h-6 w-20 opacity-20" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#B5D098]/30">
                  <div className="flex gap-3">
                    <div className="skeleton h-4 w-16 opacity-20" />
                    <div className="skeleton h-4 w-16 opacity-20" />
                  </div>
                  <div className="skeleton h-4 w-24 opacity-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ onViewRecipe }) => {
  const [historyRecipes, setHistoryRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(historyRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = historyRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const syncFavoriteStateFromApi = async () => {
    try {
      const response = await apiCall("/api/favorites");
      const rows = Array.isArray(response?.data) ? response.data : [];
      setFavorites(new Set(rows.map((fav) => Number(fav.recipe_id)).filter((id) => Number.isFinite(id))));
    } catch (err) {
      console.error("Failed to sync favorites:", err);
    }
  };

  const toggleFavorite = async (recipe) => {
    if (!recipe.recipeId) {
      setError("This recipe cannot be favorited because it has no recipe_id.");
      return;
    }

    try {
      setError("");
      if (favorites.has(recipe.recipeId)) {
        const response = await apiCall("/api/favorites");
        const rows = Array.isArray(response?.data) ? response.data : [];
        const match = rows.find((fav) => Number(fav.recipe_id) === Number(recipe.recipeId));
        if (match?.id) {
          await apiCall(`/api/favorites/${match.id}`, { method: "DELETE" });
        }
      } else {
        await apiCall("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ recipe_id: recipe.recipeId }),
        });
      }
      await syncFavoriteStateFromApi();
    } catch (err) {
      setError(err.message || "Failed to update favorites.");
    }
  };

  const getRelativeViewedTime = (isoDate) => {
    if (!isoDate) return "recently";
    const now = new Date();
    const viewedAt = new Date(isoDate);
    const diffMs = now - viewedAt;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < hour) {
      const mins = Math.max(1, Math.floor(diffMs / minute));
      return `${mins} min ago`;
    }
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffMs < week) {
      const days = Math.floor(diffMs / day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    const weeks = Math.floor(diffMs / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  };

  const parseOutputResponse = (outputResponse) => {
    if (!outputResponse) return null;
    if (typeof outputResponse === "object") return outputResponse;
    if (typeof outputResponse === "string") {
      try {
        return JSON.parse(outputResponse);
      } catch {
        return null;
      }
    }
    return null;
  };

  const mapHistoryToUi = (item) => {
    const parsed = parseOutputResponse(item.output_response);
    const firstSuggestion = parsed?.suggestions?.[0] || {};
    const estimatedTime = parsed?.estimatedTime || "N/A";

    return {
      id: item.id,
      recipeId: item.recipe_id ?? null,
      title: firstSuggestion.title || item.search_query || "Generated Recipe",
      type: item.source_api === "cache" ? "Cached Recipe" : "AI Generated",
      difficulty: "Medium",
      time: estimatedTime,
      servings: firstSuggestion.servings || "-",
      viewed: getRelativeViewedTime(item.searched_date),
      tags: ["history", "dishcovery", item.source_api || "recipe"],
      description: firstSuggestion.description || parsed?.message || "",
      ingredients: Array.isArray(firstSuggestion.keyIngredients) ? firstSuggestion.keyIngredients : [],
      instructions: Array.isArray(firstSuggestion.instructions) ? firstSuggestion.instructions : [],
    };
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiCall("/api/history");
        const rows = Array.isArray(response?.data) ? response.data : [];
        setHistoryRecipes(rows.map(mapHistoryToUi));
      } catch (err) {
        setError(err.message || "Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
    syncFavoriteStateFromApi();
  }, []);

  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      setError("");
      await apiCall("/api/history", { method: "DELETE" });
      setHistoryRecipes([]);
      setCurrentPage(1);
      setShowClearConfirm(false);
    } catch (err) {
      setError(err.message || "Failed to clear history.");
    } finally {
      setIsClearing(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <HistoryLoadingSkeleton />;
  }

  return (
    <div className="pb-12">
      <div
        className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-5">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              Recipe <span className="text-[#B5D098]">History</span>
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">
              All recipes you've viewed ({historyRecipes.length} total)
            </p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={isClearing || isLoading || historyRecipes.length === 0}
            className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-trash-alt mr-2"></i>
            {isClearing ? "Clearing..." : "Clear History"}
          </button>
        </div>
      </div>

      <div className="mx-4 md:mx-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {historyRecipes.length === 0 && (
          <div className="rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center"
            style={{ background: 'linear-gradient(160deg, #d6e8b8 0%, #c8dba8 100%)' }}
          >
            <div className="w-28 h-28 rounded-full bg-[#b5cc94]/60 flex items-center justify-center mb-6">
              <i className="fas fa-history text-5xl text-[#587A34]/60"></i>
            </div>
            <h3 className="text-xl font-bold text-[#2d3f1a] mb-2">No Recipe History Yet</h3>
            <p className="text-[#4a5e30] text-sm mb-2">Start generating recipes to see them here!</p>
            <p className="text-[#4a5e30]/70 text-sm italic">Your viewed recipes will appear in this collection.</p>
          </div>
        )}

        <div className="flex flex-col" style={{ minHeight: "600px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecipes.map((recipe) => {
            const isFavorited = recipe.recipeId ? favorites.has(Number(recipe.recipeId)) : false;
            return (
              <div
                key={recipe.id}
                className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300"
              >
                <div className="relative h-12 bg-[#587A34] flex items-center justify-between px-4">
                  <button
                    onClick={() => toggleFavorite(recipe)}
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 active:scale-90"
                    style={{
                      background: isFavorited ? 'rgba(240,230,209,0.2)' : 'rgba(255,255,255,0.1)',
                      border: `1.5px solid ${isFavorited ? '#F0E6D1' : 'rgba(240,230,209,0.35)'}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(240,230,209,0.25)';
                      e.currentTarget.style.borderColor = '#F0E6D1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isFavorited ? 'rgba(240,230,209,0.2)' : 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = isFavorited ? '#F0E6D1' : 'rgba(240,230,209,0.35)';
                    }}
                  >
                    {isFavorited ? (
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="#F0E6D1">
                        <path d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 018 3a3.5 3.5 0 016 2c0 4-6 8.5-6 8.5z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="#F0E6D1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 018 3a3.5 3.5 0 016 2c0 4-6 8.5-6 8.5z" />
                      </svg>
                    )}
                  </button>

                  <div className="bg-[#95A131] rounded-full px-3 py-1 text-xs font-bold text-white">
                    Viewed {recipe.viewed}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#32491B]">{recipe.title}</h3>
                  <p className="text-black/60 text-sm mt-1">{recipe.type} • {recipe.difficulty}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recipe.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#839705]/20 text-[#32491B] px-2 py-0.5 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#B5D098]/30">
                    <div className="flex gap-3 text-sm text-black/60">
                      <span><i className="far fa-clock"></i> {recipe.time}</span>
                      <span><i className="fas fa-users"></i> {recipe.servings}</span>
                    </div>
                    <button
                      onClick={() => onViewRecipe(recipe)}
                      className="text-[#587A34] hover:text-[#32491B] font-semibold text-sm transition-all cursor-pointer"
                    >
                      View Recipe <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-auto pt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#587A34] hover:bg-[#587A34]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="fas fa-chevron-left mr-1"></i> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  page === currentPage
                    ? "bg-[#587A34] text-white shadow-md"
                    : "text-[#587A34] hover:bg-[#587A34]/10"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#587A34] hover:bg-[#587A34]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
        </div>
      </div>

      {showClearConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={!isClearing ? () => setShowClearConfirm(false) : undefined}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />
              <div className="px-6 pt-6 pb-5">
                <h3 className="text-xl font-bold text-[#1B211A] mb-2">Clear history?</h3>
                <p className="text-sm text-[#4a5e30] mb-6">
                  This will permanently remove all recipe history entries.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearing}
                    className="flex-1 py-2.5 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    disabled={isClearing}
                    className="flex-1 py-2.5 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClearing ? 'Clearing...' : 'Yes, Clear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;