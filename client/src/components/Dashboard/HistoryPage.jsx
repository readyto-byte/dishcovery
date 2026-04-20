import heroBg from "../../assets/hero-bg.jpg";

const HistoryPage = () => {
  const historyRecipes = [
    {
      id: 1,
      title: "Strawberries with Yogurt & Honey",
      type: "Classic Recipe",
      difficulty: "Easy",
      time: "10 min",
      servings: 2,
      viewed: "2 days ago",
      tags: ["dessert", "healthy", "quick"]
    },
    {
      id: 2,
      title: "Classic Italian Lasagna",
      type: "Italian",
      difficulty: "Medium",
      time: "45 min",
      servings: 6,
      viewed: "3 days ago",
      tags: ["italian", "dinner"]
    },
    {
      id: 3,
      title: "Garlic Butter Salmon",
      type: "Seafood",
      difficulty: "Easy",
      time: "20 min",
      servings: 4,
      viewed: "5 days ago",
      tags: ["seafood", "healthy"]
    },
    {
      id: 4,
      title: "Vegetable Stir Fry",
      type: "Asian",
      difficulty: "Easy",
      time: "15 min",
      servings: 4,
      viewed: "1 week ago",
      tags: ["vegan", "quick"]
    },
    {
      id: 5,
      title: "Homemade Tomato Soup",
      type: "Comfort Food",
      difficulty: "Easy",
      time: "30 min",
      servings: 4,
      viewed: "1 week ago",
      tags: ["soup", "vegetarian"]
    },
    {
      id: 6,
      title: "Fluffy Pancakes",
      type: "Breakfast",
      difficulty: "Easy",
      time: "20 min",
      servings: 4,
      viewed: "2 weeks ago",
      tags: ["breakfast", "sweet"]
    }
  ];

  const handleViewRecipe = (id) => {
    alert(`Recipe details for recipe ${id} will be available soon!`);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire recipe history?')) {
      alert('History cleared!');
    }
  };

  return (
    <div className="pb-12">
      {/* History Header */}
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
            onClick={handleClearHistory}
            className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md"
          >
            <i className="fas fa-trash-alt mr-2"></i> Clear History
          </button>
        </div>
      </div>

      <div className="mx-4 md:mx-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="history-card bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-12 bg-[#587A34] flex items-center justify-end px-4">
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
      </div>
    </div>
  );
};

export default HistoryPage;