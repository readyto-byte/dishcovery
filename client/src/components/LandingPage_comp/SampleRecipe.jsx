import { useState } from "react";
import { X, Clock, Users, Flame } from "lucide-react";

// Import local adobo image from assets
import adoboImg from "/src/assets/adobo.jpg";
import bibimbapImg from "/src/assets/bibimbap.jpg";

// Unsplash images for other cuisines (will change these later)
const recipeImages = {
  japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&h=400&fit=crop",
  filipino: adoboImg,
  italian: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=400&fit=crop",
  korean: bibimbapImg, 
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop",
  thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&h=400&fit=crop",
};

const recipes = [
  {
    id: 1,
    image: recipeImages.japanese,
    title: "Sushi Maki Roll",
    cuisine: "Japanese",
    difficulty: "Medium",
    time: "45m",
    servings: 2,
    calories: 420,
    tags: ["Seafood", "Sushi", "Raw Fish", "Japanese", "Fresh", "Healthy"],
    ingredients: [
      "2 cups sushi rice",
      "3 tbsp rice vinegar",
      "1 tbsp sugar",
      "1 tsp salt",
      "4 sheets nori (seaweed)",
      "200g fresh salmon or tuna",
      "1 cucumber (julienned)",
      "1 avocado (sliced)",
      "Soy sauce for dipping",
      "Wasabi and pickled ginger"
    ],
    instructions: [
      "Cook sushi rice according to package instructions. Mix rice vinegar, sugar, and salt, then fold into cooked rice.",
      "Place a nori sheet on a bamboo mat, shiny side down. Spread rice evenly, leaving 1cm at top edge.",
      "Arrange fish, cucumber, and avocado in a line across the center of the rice.",
      "Roll tightly using the bamboo mat, pressing gently to seal.",
      "Slice into 6-8 pieces with a sharp, wet knife.",
      "Serve with soy sauce, wasabi, and pickled ginger."
    ]
  },
  {
    id: 2,
    image: recipeImages.filipino,
    title: "Chicken Adobo",
    cuisine: "Filipino",
    difficulty: "Easy",
    time: "50m",
    servings: 4,
    calories: 450,
    tags: ["Filipino", "Savory", "Garlic", "Vinegar-Based", "Comfort Food", "Gluten-Free Option"],
    ingredients: [
      "2 lbs chicken thighs and drumsticks",
      "1/2 cup soy sauce",
      "1/2 cup white vinegar",
      "1 head garlic (crushed)",
      "3 bay leaves",
      "1 tsp black peppercorns",
      "1 tbsp cooking oil",
      "1 cup water",
      "1 tbsp brown sugar (optional)",
      "Green onions for garnish"
    ],
    instructions: [
      "In a bowl, combine chicken, soy sauce, garlic, bay leaves, and peppercorns. Marinate for 30 minutes.",
      "Heat oil in a pot over medium heat. Remove chicken from marinade and sear until golden brown (reserve marinade).",
      "Pour the reserved marinade and water into the pot. Bring to a boil.",
      "Add vinegar WITHOUT stirring (to avoid bitterness). Cover and simmer for 20 minutes.",
      "Add brown sugar if using, stir gently. Continue simmering for 10 more minutes until sauce thickens.",
      "Serve hot over steamed rice with the rich sauce drizzled on top."
    ]
  },
  {
    id: 3,
    image: recipeImages.italian,
    title: "Pasta Carbonara",
    cuisine: "Italian",
    difficulty: "Medium",
    time: "30m",
    servings: 4,
    calories: 650,
    tags: ["Pasta", "Pork", "Creamy", "Italian", "Roman", "Cheesy", "Bacon"],
    ingredients: [
      "400g spaghetti or bucatini",
      "150g guanciale or pancetta (diced)",
      "3 large eggs",
      "1 cup grated Pecorino Romano",
      "1 cup grated Parmigiano",
      "Black pepper (freshly ground)",
      "Salt for pasta water"
    ],
    instructions: [
      "Bring salted water to a boil and cook pasta until al dente.",
      "While pasta cooks, fry guanciale in a pan until crispy (no oil needed).",
      "In a bowl, whisk eggs, both cheeses, and plenty of black pepper.",
      "Reserve 1 cup pasta water, then drain pasta.",
      "Working quickly, add hot pasta to the pan with guanciale. Remove from heat.",
      "Pour egg mixture over pasta and toss vigorously. Add pasta water if needed for creaminess.",
      "Serve immediately with extra cheese and black pepper."
    ]
  },
  {
    id: 4,
    image: recipeImages.korean,
    title: "Bibimbap Bowl",
    cuisine: "Korean",
    difficulty: "Easy",
    time: "35m",
    servings: 2,
    calories: 520,
    tags: ["Korean", "Rice Bowl", "Vegetarian Option", "Spicy", "Colorful", "Healthy", "Gochujang"],
    ingredients: [
      "2 cups cooked white rice",
      "1 carrot (julienned)",
      "1 zucchini (sliced thin)",
      "2 cups spinach",
      "4 shiitake mushrooms (sliced)",
      "2 eggs",
      "4 tbsp gochujang (Korean chili paste)",
      "1 tbsp sesame oil",
      "1 tbsp sesame seeds",
      "2 tsp soy sauce",
      "1 tsp sugar"
    ],
    instructions: [
      "Cook each vegetable separately in a pan with a little oil until tender. Season lightly with salt.",
      "Season spinach with sesame oil and a pinch of salt.",
      "Cook mushrooms with soy sauce and sugar until caramelized.",
      "Fry eggs sunny-side up (keep yolk runny).",
      "Assemble bowls: Start with rice at the bottom.",
      "Arrange vegetables and mushrooms in separate sections around the bowl.",
      "Place the fried egg in the center.",
      "Add gochujang, drizzle sesame oil, and sprinkle sesame seeds.",
      "Mix everything together before eating!"
    ]
  },
  {
    id: 5,
    image: recipeImages.indian,
    title: "Tandoori Chicken",
    cuisine: "Indian",
    difficulty: "Medium",
    time: "60m",
    servings: 4,
    calories: 490,
    tags: ["Indian", "Spicy", "Grilled", "Yogurt-Marinated", "Gluten-Free", "Tandoor", "Smoky"],
    ingredients: [
      "8 chicken drumsticks or thighs",
      "1 cup Greek yogurt",
      "2 tbsp lemon juice",
      "4 cloves garlic (minced)",
      "1 tbsp ginger (grated)",
      "2 tsp cumin",
      "2 tsp coriander",
      "1 tsp turmeric",
      "1 tsp cayenne pepper",
      "1 tsp garam masala",
      "1 tsp paprika",
      "Salt to taste",
      "Oil for brushing"
    ],
    instructions: [
      "Score chicken with shallow cuts. Mix lemon juice and salt, rub into chicken. Set aside 15 min.",
      "In a bowl, combine yogurt, garlic, ginger, and all spices.",
      "Coat chicken thoroughly with marinade. Cover and refrigerate 4+ hours (overnight is best).",
      "Preheat oven to 450°F (230°C) or grill to medium-high.",
      "Brush excess marinade off chicken. Arrange on a baking sheet or grill.",
      "Cook for 20-25 minutes, turning once, until charred spots appear and chicken is cooked through.",
      "Garnish with fresh cilantro and lemon wedges. Serve with naan or rice."
    ]
  },
  {
    id: 6,
    image: recipeImages.thai,
    title: "Pad Thai Noodles",
    cuisine: "Thai",
    difficulty: "Medium",
    time: "40m",
    servings: 4,
    calories: 530,
    tags: ["Thai", "Street Food", "Noodles", "Sweet & Sour", "Shrimp", "Peanuts", "Stir-fry"],
    ingredients: [
      "200g rice noodles",
      "200g shrimp or tofu",
      "2 eggs",
      "3 tbsp tamarind paste",
      "3 tbsp fish sauce",
      "2 tbsp palm sugar (or brown sugar)",
      "2 shallots (chopped)",
      "3 garlic cloves (minced)",
      "2 cups bean sprouts",
      "4 green onions (chopped)",
      "1/4 cup crushed peanuts",
      "1 lime (cut into wedges)",
      "Chili flakes to taste"
    ],
    instructions: [
      "Soak rice noodles in warm water for 30 minutes until soft. Drain and set aside.",
      "Mix tamarind paste, fish sauce, and sugar in a small bowl to make sauce.",
      "Heat oil in a wok. Add shallots and garlic, stir for 30 seconds.",
      "Add shrimp or tofu, cook until almost done (2-3 minutes). Push to one side.",
      "Crack eggs into the wok, scramble until set, then mix with shrimp.",
      "Add noodles and sauce. Toss everything together for 2-3 minutes.",
      "Add bean sprouts and green onions, toss for 30 more seconds.",
      "Serve immediately with crushed peanuts, lime wedges, and chili flakes."
    ]
  }
];

const RecipeModal = ({ recipe, onClose }) => {
  const [showIngredients, setShowIngredients] = useState(true);
  
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full h-56 sm:h-64 sticky top-0 z-10">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow transition backdrop-blur-sm"
          >
            <X size={18} className="text-[#1B211A]" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6">
          <h2 className="text-2xl font-bold font-roboto text-[#1B211A] mb-2">{recipe.title}</h2>

          {/* Tags - Now showing multiple tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.cuisine}</span>
            <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.difficulty}</span>
            {recipe.tags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-xs font-freeman px-2.5 py-1 rounded-full bg-[#8BAE66]/20 text-[#3d5e28]">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm text-gray-500 font-freeman mb-6 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings}</span>
            <span className="flex items-center gap-1"><Flame size={14} /> {recipe.calories} cal</span>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setShowIngredients(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                showIngredients 
                  ? "bg-[#8BAE66] text-white" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setShowIngredients(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                !showIngredients 
                  ? "bg-[#8BAE66] text-white" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Instructions
            </button>
          </div>

          {/* Content Area */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
            {showIngredients ? (
              <div>
                <h3 className="font-bold font-roboto text-[#1B211A] mb-3 text-lg">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="text-sm text-gray-700 font-freeman flex items-start gap-2">
                      <span className="text-[#8BAE66] font-bold">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="font-bold font-roboto text-[#1B211A] mb-3 text-lg">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-700 font-freeman flex gap-3">
                      <span className="font-bold text-[#8BAE66] min-w-[24px]">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #8BAE66;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #6d8f4a;
        }
      `}</style>
    </div>
  );
};

const RecipesSection = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  return (
    <div className="w-full bg-[#F0F5E8] py-14 px-6 sm:py-20 lg:py-24 lg:px-16">

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-roboto text-[#1B211A] mb-10 text-center">
        Here are some recipes you can try right now.
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer duration-300"
          >
            <div className="w-full h-48 overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold font-roboto text-[#1B211A] mb-2 line-clamp-1">{recipe.title}</h3>
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.cuisine}</span>
                <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-freeman mb-3">
                <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings}</span>
                <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories} cal</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs font-freeman px-2 py-0.5 rounded-full bg-[#8BAE66]/20 text-[#3d5e28]">
                    {tag}
                  </span>
                ))}
                {recipe.tags.length > 3 && (
                  <span className="text-xs font-freeman px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    +{recipe.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
};

export default RecipesSection;