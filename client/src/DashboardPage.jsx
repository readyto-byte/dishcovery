import { useState } from 'react';
import Sidebar from "./components/Dashboard/Sidebar";
import DashboardNavbar from "./components/Dashboard/DashboardNavbar";
import WelcomeBanner from "./components/Dashboard/WelcomeBanner";
import CreateRecipeSection from "./components/Dashboard/CreateRecipeSection";
import RecipeCard from "./components/Dashboard/RecipeCard";
// import HistoryPage from "./components/Dashboard/HistoryPage";  // COMMENT OUT - doesn't exist yet
// import ProfilePage from "./components/Dashboard/ProfilePage";  // COMMENT OUT - doesn't exist yet
// import SettingsPage from "./components/Dashboard/SettingsPage";  // COMMENT OUT - doesn't exist yet

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let newRecipe = { ...recipeData };
    
    if (userInput.toLowerCase().includes("chicken")) {
      newRecipe = {
        title: "Herb Roasted Chicken",
        description: "Juicy chicken roasted with fresh herbs and garlic, perfect for a family dinner.",
        prepTime: "10 min",
        cookTime: "35 min",
        servings: "4",
        difficulty: "easy",
        tags: ["main dish", "roasted", "delicious"],
        ingredients: ["4 chicken thighs", "2 tbsp olive oil", "3 cloves garlic", "1 tsp rosemary", "Salt and pepper"],
        instructions: ["Preheat oven to 400°F.", "Rub chicken with oil and herbs.", "Roast for 35 minutes.", "Rest before serving."]
      };
    } else if (userInput.toLowerCase().includes("pasta")) {
      newRecipe = {
        title: "Creamy Garlic Pasta",
        description: "Rich and creamy pasta with garlic and parmesan, ready in 20 minutes.",
        prepTime: "5 min",
        cookTime: "15 min",
        servings: "4",
        difficulty: "easy",
        tags: ["pasta", "quick", "creamy"],
        ingredients: ["200g pasta", "2 tbsp butter", "3 cloves garlic", "1/2 cup heavy cream", "Parmesan cheese"],
        instructions: ["Cook pasta according to package.", "Sauté garlic in butter.", "Add cream and simmer.", "Toss with pasta and parmesan."]
      };
    }
    
    setRecipeData(newRecipe);
    setIsLoading(false);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <>
            <WelcomeBanner />
            <CreateRecipeSection onGenerate={generateRecipe} isLoading={isLoading} />
            <RecipeCard recipeData={recipeData} isLoading={isLoading} />
          </>
        );
      case 'history':
        return <div className="mx-4 md:mx-8 mt-6"><div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden p-12 text-center"><p className="text-[#F0E6D1] text-xl">History Page - Coming Soon!</p></div></div>;
      case 'profile':
        return <div className="mx-4 md:mx-8 mt-6"><div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden p-12 text-center"><p className="text-[#F0E6D1] text-xl">Profile Page - Coming Soon!</p></div></div>;
      case 'settings':
        return <div className="mx-4 md:mx-8 mt-6"><div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden p-12 text-center"><p className="text-[#F0E6D1] text-xl">Settings Page - Coming Soon!</p></div></div>;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#B5D098]">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
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
    </div>
  );
};

export default DashboardPage;