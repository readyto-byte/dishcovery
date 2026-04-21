import heroBg from "../../assets/hero-bg.jpg";

const HistoryPage = ({ onViewRecipe }) => {

  const historyRecipes = [
    {
      id: 1,
      title: "Strawberries with Yogurt & Honey",
      type: "Classic Recipe",
      difficulty: "Easy",
      time: "10 min",
      servings: 2,
      viewed: "2 days ago",
      tags: ["dessert", "healthy", "quick"],
      description: "A refreshing and wholesome treat that combines sweet strawberries with creamy yogurt and a drizzle of honey.",
      ingredients: [
        "2 cups fresh strawberries, hulled and sliced",
        "1 cup plain Greek yogurt",
        "2 tablespoons honey",
        "1 teaspoon vanilla extract",
        "1 tablespoon chopped fresh mint (optional)"
      ],
      instructions: [
        "Wash and hull the strawberries, then slice them evenly.",
        "In a bowl, combine yogurt, honey, and vanilla extract. Mix well.",
        "Gently fold the sliced strawberries into the yogurt mixture.",
        "Garnish with fresh mint leaves if desired.",
        "Serve immediately or refrigerate for up to 15 minutes before serving."
      ]
    },
    {
      id: 2,
      title: "Classic Italian Lasagna",
      type: "Italian",
      difficulty: "Medium",
      time: "45 min",
      servings: 6,
      viewed: "3 days ago",
      tags: ["italian", "dinner"],
      description: "A hearty, layered Italian classic with rich meat sauce, creamy béchamel, and melted cheese.",
      ingredients: [
        "12 lasagna noodles",
        "500g ground beef",
        "1 can (400g) crushed tomatoes",
        "1 onion, diced",
        "3 garlic cloves, minced",
        "2 cups ricotta cheese",
        "2 cups shredded mozzarella",
        "½ cup grated Parmesan",
        "2 tablespoons olive oil",
        "Salt, pepper, and Italian seasoning to taste"
      ],
      instructions: [
        "Preheat oven to 190°C (375°F). Cook lasagna noodles per package instructions.",
        "Sauté onion and garlic in olive oil until soft. Add ground beef and cook until browned.",
        "Stir in crushed tomatoes and seasoning. Simmer for 15 minutes.",
        "Layer meat sauce, noodles, ricotta, and mozzarella in a baking dish. Repeat layers.",
        "Top with remaining mozzarella and Parmesan.",
        "Cover with foil and bake for 25 minutes, then uncover and bake 15 more minutes.",
        "Let rest 10 minutes before serving."
      ]
    },
    {
      id: 3,
      title: "Garlic Butter Salmon",
      type: "Seafood",
      difficulty: "Easy",
      time: "20 min",
      servings: 4,
      viewed: "5 days ago",
      tags: ["seafood", "healthy"],
      description: "Pan-seared salmon fillets bathed in a rich garlic butter sauce — quick, elegant, and absolutely delicious.",
      ingredients: [
        "4 salmon fillets",
        "3 tablespoons unsalted butter",
        "4 garlic cloves, minced",
        "1 lemon, juiced and zested",
        "2 tablespoons fresh parsley, chopped",
        "Salt and pepper to taste",
        "1 tablespoon olive oil"
      ],
      instructions: [
        "Season salmon fillets with salt and pepper on both sides.",
        "Heat olive oil in a skillet over medium-high heat.",
        "Sear salmon skin-side up for 4 minutes, then flip and cook 3 more minutes.",
        "Reduce heat and add butter and garlic to the pan. Baste salmon with the melted butter.",
        "Add lemon juice and zest. Cook 1 more minute.",
        "Garnish with fresh parsley and serve immediately."
      ]
    },
    {
      id: 4,
      title: "Vegetable Stir Fry",
      type: "Asian",
      difficulty: "Easy",
      time: "15 min",
      servings: 4,
      viewed: "1 week ago",
      tags: ["vegan", "quick"],
      description: "A vibrant and colorful stir fry packed with fresh vegetables in a savory soy-ginger sauce.",
      ingredients: [
        "1 cup broccoli florets",
        "1 red bell pepper, sliced",
        "1 cup snap peas",
        "1 carrot, julienned",
        "2 tablespoons soy sauce",
        "1 tablespoon sesame oil",
        "1 teaspoon fresh ginger, grated",
        "2 garlic cloves, minced",
        "1 tablespoon vegetable oil",
        "Sesame seeds to garnish"
      ],
      instructions: [
        "Heat vegetable oil in a wok or large pan over high heat.",
        "Add garlic and ginger, stir fry for 30 seconds.",
        "Add carrots and broccoli, cook for 2 minutes.",
        "Add bell pepper and snap peas, cook for another 2 minutes.",
        "Pour in soy sauce and sesame oil, toss to combine.",
        "Garnish with sesame seeds and serve over rice or noodles."
      ]
    },
    {
      id: 5,
      title: "Homemade Tomato Soup",
      type: "Comfort Food",
      difficulty: "Easy",
      time: "30 min",
      servings: 4,
      viewed: "1 week ago",
      tags: ["soup", "vegetarian"],
      description: "A velvety, warming tomato soup made from scratch — the ultimate comfort food on a cold day.",
      ingredients: [
        "6 ripe tomatoes, chopped",
        "1 onion, diced",
        "3 garlic cloves, minced",
        "2 cups vegetable broth",
        "2 tablespoons olive oil",
        "1 teaspoon sugar",
        "½ cup heavy cream (optional)",
        "Fresh basil leaves",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Heat olive oil in a large pot. Sauté onion and garlic until translucent.",
        "Add chopped tomatoes and sugar. Cook for 10 minutes until softened.",
        "Pour in vegetable broth and bring to a boil. Simmer for 15 minutes.",
        "Blend the soup until smooth using an immersion blender.",
        "Stir in heavy cream if using. Season with salt and pepper.",
        "Serve hot with fresh basil and crusty bread."
      ]
    },
    {
      id: 6,
      title: "Fluffy Pancakes",
      type: "Breakfast",
      difficulty: "Easy",
      time: "20 min",
      servings: 4,
      viewed: "2 weeks ago",
      tags: ["breakfast", "sweet"],
      description: "Light, airy, golden pancakes that are perfectly fluffy inside — a breakfast classic everyone loves.",
      ingredients: [
        "1½ cups all-purpose flour",
        "3½ teaspoons baking powder",
        "1 tablespoon sugar",
        "¼ teaspoon salt",
        "1¼ cups milk",
        "1 egg",
        "3 tablespoons melted butter",
        "1 teaspoon vanilla extract",
        "Butter and maple syrup to serve"
      ],
      instructions: [
        "In a large bowl, whisk together flour, baking powder, sugar, and salt.",
        "In another bowl, beat together milk, egg, melted butter, and vanilla.",
        "Pour wet ingredients into dry ingredients and stir until just combined — do not overmix.",
        "Heat a lightly buttered griddle over medium heat.",
        "Pour ¼ cup batter per pancake. Cook until bubbles form on surface, then flip.",
        "Cook 1–2 more minutes until golden. Serve with butter and maple syrup."
      ]
    }
  ];

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
            className="shrink-0 bg-[#587A34] hover:bg-[#32491B] transition-all px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-md cursor-pointer"
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
              className="bg-[#F0E6D1] rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300"
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
      </div>
    </div>
  );
};

export default HistoryPage;