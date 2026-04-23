import { useState, useEffect } from 'react';
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

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

const FavoritesPage = ({ onViewRecipe }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setError("");
        const response = await apiCall("/api/favorites");
        const rows = Array.isArray(response?.data) ? response.data : [];
        setFavorites(rows);
      } catch (error) {
        setError(error.message || "Failed to load favorites.");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const removeFromFavorites = async (favoriteId) => {
    if (confirm('Remove this recipe from your favorites?')) {
      try {
        setError("");
        await apiCall(`/api/favorites/${favoriteId}`, { method: "DELETE" });
        setFavorites((prev) => prev.filter((recipe) => recipe.id !== favoriteId));
      } catch (err) {
        setError(err.message || "Failed to remove favorite.");
      }
    }
  };

  const handleClearAllFavorites = async () => {
    try {
      setIsClearing(true);
      setError("");
      await apiCall("/api/favorites", { method: "DELETE" });
      setFavorites([]);
      setShowClearConfirm(false);
    } catch (err) {
      setError(err.message || "Failed to clear favorites.");
    } finally {
      setIsClearing(false);
    }
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
              <div className="w-6 h-6 bg-[#B5D098]/30 rounded-full flex items-center justify-center mr-2">
                <i className="fas fa-heart text-[#B5D098] text-[10px]"></i>
              </div>
              <p className="text-[#B5D098] text-sm">
                {favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}
              </p>
            </div>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing}
              className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-heart-broken mr-2"></i> 
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
        {favorites.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300"
              >
                <div className="relative h-12 bg-[#587A34] flex items-center justify-between px-4">
                  <div className="bg-red-500 rounded-full px-3 py-1 text-xs font-bold text-white">
                    <i className="fas fa-heart mr-1"></i> Favorite
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(recipe.id);
                    }}
                    className="bg-white/20 hover:bg-red-500 rounded-full px-3 py-1 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Remove
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#32491B]">{recipe.title}</h3>
                  <p className="text-black/60 text-sm mt-1">
                    {recipe.type || 'Saved Recipe'} • {recipe.difficulty || 'Medium'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.map((tag, idx) => (
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
                      <span><i className="far fa-clock"></i> {recipe.time || recipe.prepTime || '15 min'}</span>
                      <span><i className="fas fa-users"></i> {recipe.servings || 2}</span>
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
        )}
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