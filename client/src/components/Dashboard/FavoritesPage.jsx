import { useState, useEffect } from 'react';
import heroBg from "../../assets/hero-bg.jpg";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favoriteRecipes');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
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
  }, []);

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
      {/* Updated Header Section */}
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
            <div className="flex items-center mt-1">
              {/* Small circular icon to match the empty state style */}
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