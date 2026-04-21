import { useState, useEffect } from 'react';
import heroBg from "../../assets/hero-bg.jpg";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage with error handling
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favoriteRecipes');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          // Make sure it's an array
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites);
          } else {
            setFavorites([]);
          }
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []); // Empty dependency array - only runs once on mount

  const removeFromFavorites = (recipeId) => {
    if (confirm('Remove this recipe from your favorites?')) {
      const updatedFavorites = favorites.filter(recipe => recipe.id !== recipeId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
    }
  };

  const handleClearAllFavorites = () => {
    if (confirm('Are you sure you want to remove ALL recipes from your favorites?')) {
      setFavorites([]);
      localStorage.setItem('favoriteRecipes', JSON.stringify([]));
    }
  };

  const handleViewRecipe = (id) => {
    const recipe = favorites.find(f => f.id === id);
    alert(`Recipe details for "${recipe?.title || 'this recipe'}" will be available soon!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#32491B]"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Favorites Header - ALWAYS SHOWS, even with no favorites */}
      <div
        className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl"
        style={{ 
          backgroundImage: `url(${heroBg})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative px-8 py-7 flex items-center justify-between gap-5">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              My <span className="text-[#B5D098]">Favorites</span>
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">
              <i className="fas fa-heart text-red-400 mr-1"></i> 
              {favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={handleClearAllFavorites}
              className="shrink-0 bg-red-600/80 hover:bg-red-700 transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md"
            >
              <i className="fas fa-heart-broken mr-2"></i> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="mx-4 md:mx-8">
        {favorites.length === 0 ? (
          // Empty state - no favorites yet
          <div className="bg-[#F0E6D1]/50 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="text-7xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold text-[#32491B] mb-2">No favorites yet</h3>
            <p className="text-[#587A34] text-lg mb-4">Start adding recipes to your favorites collection!</p>
            <p className="text-black/60 text-sm">
              <i className="fas fa-heart text-red-500 mr-1"></i> 
              Click the heart icon on any recipe to save it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300"
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
                    className="bg-white/20 hover:bg-red-500 rounded-full px-3 py-1 text-xs font-bold text-white transition-all"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Remove
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#32491B]">{recipe.title}</h3>
                  <p className="text-black/60 text-sm mt-1">
                    {recipe.type || 'Saved Recipe'} • {recipe.difficulty || 'Medium'}
                  </p>
                  
                  {/* Tags Section */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#839705]/20 text-[#32491B] px-2 py-0.5 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                    {(!recipe.tags || !Array.isArray(recipe.tags) || recipe.tags.length === 0) && (
                      <>
                        <span className="bg-[#839705]/20 text-[#32491B] px-2 py-0.5 rounded-full text-xs font-semibold">
                          <i className="fas fa-star mr-1"></i> Saved
                        </span>
                        <span className="bg-[#839705]/20 text-[#32491B] px-2 py-0.5 rounded-full text-xs font-semibold">
                          <i className="fas fa-clock mr-1"></i> {recipe.prepTime || 'Quick'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#B5D098]/30">
                    <div className="flex gap-3 text-sm text-black/60">
                      <span><i className="far fa-clock"></i> {recipe.time || recipe.prepTime || '15 min'}</span>
                      <span><i className="fas fa-users"></i> {recipe.servings || 2}</span>
                    </div>
                    <button
                      onClick={() => handleViewRecipe(recipe.id)}
                      className="text-[#587A34] hover:text-[#32491B] font-semibold text-sm transition-all"
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
    </div>
  );
};

export default FavoritesPage;