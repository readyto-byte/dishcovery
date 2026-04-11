import { useState } from "react";
import { X, Clock, Users, Flame } from "lucide-react";
import pic1 from "../assets/placeholder1.jpg";

const recipes = [
  { id: 1, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
  { id: 2, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
  { id: 3, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
  { id: 4, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
  { id: 5, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
  { id: 6, image: pic1, title: "Kinilaw na Pochi", cuisine: "Filipino", difficulty: "Easy", time: "15m", servings: 4, calories: 285, tag: "Vegetarian" },
];

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full h-56 sm:h-64">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow hover:bg-gray-100 transition"
          >
            <X size={18} className="text-[#1B211A]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-xl font-bold font-roboto text-[#1B211A] mb-2">{recipe.title}</h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.cuisine}</span>
            <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.difficulty}</span>
            <span className="text-xs font-freeman px-2.5 py-1 rounded-full bg-[#8BAE66]/20 text-[#3d5e28]">{recipe.tag}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm text-gray-500 font-freeman mb-6">
            <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings}</span>
            <span className="flex items-center gap-1"><Flame size={14} /> {recipe.calories} cal</span>
          </div>

          {/* Placeholder content */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold font-roboto text-[#1B211A] mb-2">Ingredients</h3>
              <p className="text-sm text-gray-400 font-freeman italic">Recipe ingredients will appear here.</p>
            </div>
            <div>
              <h3 className="font-bold font-roboto text-[#1B211A] mb-2">Instructions</h3>
              <p className="text-sm text-gray-400 font-freeman italic">Step-by-step instructions will appear here.</p>
            </div>
          </div>
        </div>
      </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="w-full h-44 sm:h-48 overflow-hidden">
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold font-roboto text-[#1B211A] mb-2">{recipe.title}</h3>
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.cuisine}</span>
                <span className="text-xs font-freeman px-2.5 py-1 rounded-full border border-gray-300 text-gray-600">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-freeman mb-3">
                <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings}</span>
                <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories} cal</span>
              </div>
              <span className="text-xs font-freeman px-2.5 py-1 rounded-full bg-[#8BAE66]/20 text-[#3d5e28]">{recipe.tag}</span>
            </div>
          </div>
        ))}
      </div>

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
};

export default RecipesSection;