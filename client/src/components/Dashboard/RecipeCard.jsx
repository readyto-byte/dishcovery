const RecipeCard = ({ recipeData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mx-4 md:mx-8">
        <div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F0E6D1] border-t-[#95A131] mb-4"></div>
          <p className="text-[#F0E6D1] text-xl font-semibold">FoodGPT is cooking up something delicious...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-8 recipe-card">
      <div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#95A131] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-check-circle text-[#F0E6D1] text-2xl"></i>
            <span className="text-[#F0E6D1] text-lg font-semibold">Here's a recipe you can cook right now.</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[#F0E6D1]/80 text-base">Classic Recipe</p>
              <h3 className="text-3xl md:text-4xl font-bold text-[#F0E6D1]">{recipeData.title}</h3>
            </div>
            <button className="bg-[#587A34] hover:bg-[#32491B] transition-all px-6 py-2 rounded-lg font-bold text-white text-lg shadow-md">
              Start Cooking <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <p className="text-[#F0E6D1] text-lg md:text-xl mb-6">{recipeData.description}</p>
          
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-[#F0E6D1]/20">
            <div className="flex items-center gap-2">
              <i className="fas fa-kitchen-set text-[#F0E6D1] text-xl"></i>
              <span className="text-[#F0E6D1] font-semibold">Prep: {recipeData.prepTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-[#F0E6D1] text-xl"></i>
              <span className="text-[#F0E6D1] font-semibold">Cook: {recipeData.cookTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-users text-[#F0E6D1] text-xl"></i>
              <span className="text-[#F0E6D1] font-semibold">Serves: {recipeData.servings}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-chart-line text-[#F0E6D1] text-xl"></i>
              <span className="text-[#F0E6D1] font-semibold">Difficulty: {recipeData.difficulty}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {recipeData.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#839705] text-white px-4 py-1.5 rounded-full text-sm font-semibold">{tag}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#F0E6D1]/10 rounded-xl p-5">
              <h4 className="text-2xl font-bold text-[#F0E6D1] mb-4 flex items-center gap-2">
                <i className="fas fa-shopping-basket"></i> Ingredients
              </h4>
              <ul className="space-y-2 text-[#F0E6D1]/90 text-base md:text-lg">
                {recipeData.ingredients.map((ing, idx) => (
                  <li key={idx}>• {ing}</li>
                ))}
              </ul>
            </div>
            <div className="bg-[#F0E6D1]/10 rounded-xl p-5">
              <h4 className="text-2xl font-bold text-[#F0E6D1] mb-4 flex items-center gap-2">
                <i className="fas fa-list-ol"></i> Instructions
              </h4>
              <ol className="space-y-2 text-[#F0E6D1]/90 text-base md:text-lg list-decimal list-inside">
                {recipeData.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[#F0E6D1]/20">
            <button className="bg-[#839705] hover:bg-[#95A131] transition-all px-6 py-3 rounded-lg font-bold text-white text-lg shadow-md flex items-center gap-2">
              <i className="far fa-bookmark"></i> Save Recipe
            </button>
            <button className="bg-[#839705] hover:bg-[#95A131] transition-all px-6 py-3 rounded-lg font-bold text-white text-lg shadow-md flex items-center gap-2">
              <i className="far fa-heart"></i> Add to Favorites
            </button>
            <button className="bg-[#587A34] hover:bg-[#32491B] transition-all px-6 py-3 rounded-lg font-bold text-white text-lg shadow-md flex items-center gap-2 ml-auto">
              <i className="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;  // ← MAKE SURE THIS IS AT THE BOTTOM!