import { useState, useEffect } from 'react';
import { RotateCcw } from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

const RECIPES_PER_PAGE = 9;

const FavoritesLoadingSkeleton = () => {
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
              <div className="h-12 bg-[#587A34] flex items-center justify-end px-4">
                <div className="skeleton h-6 w-6 rounded-full opacity-30" />
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

const FavoritesPage = ({ onViewRecipe, activeProfile }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(favorites.length / RECIPES_PER_PAGE);
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  useEffect(() => {
    setLoading(true);
    const loadFavorites = async () => {
      try {
        setError("");
        const profileParam = activeProfile?.id ? `?profile_id=${activeProfile.id}` : "";
        const response = await apiCall(`/api/favorites${profileParam}`);
        const rows = Array.isArray(response?.data) ? response.data : [];
        setFavorites(rows);
        setCurrentPage(1);
      } catch (error) {
        setError(error.message || "Failed to load favorites.");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [activeProfile?.id]);

  const removeFromFavorites = async (favoriteId) => {
    try {
      setError("");
      const profileParam = activeProfile?.id ? `?profile_id=${activeProfile.id}` : "";
      await apiCall(`/api/favorites/${favoriteId}${profileParam}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((recipe) => recipe.id !== favoriteId));
      setShowDeleteConfirm(false);
      setRecipeToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to remove favorite.");
    }
  };

  const handleClearAllFavorites = async () => {
    try {
      setIsClearing(true);
      setError("");
      const profileParam = activeProfile?.id ? `?profile_id=${activeProfile.id}` : "";
      await apiCall(`/api/favorites${profileParam}`, { method: "DELETE" });
      setFavorites([]);
      setShowClearConfirm(false);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to clear favorites.");
    } finally {
      setIsClearing(false);
    }
  };

  const openDeleteConfirm = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteConfirm(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <FavoritesLoadingSkeleton />;
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
              My <span className="text-[#B5D098]">Favorites</span>
            </h1>
            <div className="flex items-center mt-1">
              <p className="text-[#B5D098] text-sm">
                {favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}
              </p>
            </div>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing}
              className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isClearing ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
      </div>

      <div className="mx-4 md:mx-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="flex flex-col" style={{ minHeight: "600px" }}>
          {paginatedFavorites.length === 0 ? (
            <div className="bg-[#F0E6D1]/50 backdrop-blur-sm rounded-2xl p-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-[#B5D098]/40 rounded-full flex items-center justify-center">
                  <i className="fas fa-heart text-[#889E73] text-6xl"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#32491B] mb-2">No Saved Dishcoveries</h3>
              <p className="text-[#587A34] text-lg mb-6">Start adding recipes to your favorites collection!</p>
              <p className="text-black/40 text-sm italic">
                Click the heart icon on any recipe card to see it here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedFavorites.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative h-12 bg-[#587A34] flex items-center justify-end px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(recipe);
                        }}
                        className="bg-white/20 hover:bg-red-500 rounded-full p-2 text-white transition-all cursor-pointer"
                        title="Remove from favorites"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-[#32491B]">{recipe.title}</h3>
                      <p className="text-black/60 text-sm mt-1">
                        Saved Recipe
                      </p>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#B5D098]/30">
                        <div className="flex gap-3 text-sm text-black/60">
                          <span><i className="far fa-clock"></i> {recipe.prepTime || '15 min'}</span>
                          <span><i className="fas fa-users"></i> Serves {recipe.servings || 2}</span>
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
                ))}
              </div>

              {/* Pagination - only shows when there are more than 9 recipes */}
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
            </>
          )}
        </div>
      </div>

      {/* Delete Single Favorite Confirmation Modal */}
      {showDeleteConfirm && recipeToDelete && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />
              <div className="px-6 pt-6 pb-5">
                <h3 className="text-xl font-bold text-[#1B211A] mb-2">Remove from favorites?</h3>
                <p className="text-sm text-[#4a5e30] mb-6">
                  Are you sure you want to remove "{recipeToDelete.title}" from your favorites?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeFromFavorites(recipeToDelete.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#587A34] hover:bg-[#32491B] text-white font-semibold text-sm transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Clear All Favorites Confirmation Modal */}
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
                <h3 className="text-xl font-bold text-[#1B211A] mb-2">Clear all favorites?</h3>
                <p className="text-sm text-[#4a5e30] mb-6">
                  This will permanently remove all recipes from your favorites.
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
                    onClick={handleClearAllFavorites}
                    disabled={isClearing}
                    className="flex-1 py-2.5 rounded-xl bg-[#587A34] hover:bg-[#32491B] text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClearing ? 'Clearing...' : 'Yes, Clear All'}
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

export default FavoritesPage;