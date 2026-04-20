import { useState } from 'react';

const CreateRecipeSection = ({ onGenerate, isLoading }) => {
  const [recipeInput, setRecipeInput] = useState('');

  const chips = [
    { icon: 'fa-fire', text: 'High protein dinner' },
    { icon: 'fa-clock', text: 'Quick lunch' },
    { icon: 'fa-coins', text: 'Budget meal' }
  ];

  const handleGenerate = () => {
    if (!recipeInput.trim()) {
      alert('🍽️ Please describe what you want to cook!');
      return;
    }
    onGenerate(recipeInput);
  };

  return (
    <div className="mx-4 md:mx-8 mb-8">
      <div className="bg-[#587A34] rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#95A131] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <i className="fas fa-magic text-[#F0E6D1] text-3xl md:text-4xl"></i>
            <h2 className="text-2xl md:text-3xl font-bold text-[#F0E6D1]">CREATE A RECIPE</h2>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold text-[#F0E6D1] mb-3">What do you want to cook today?</h3>
          <p className="text-[#F0E6D1]/90 text-lg md:text-xl mb-6">
            Share an idea, ingredients, or a cooking goal and FoodGPT will help turn it into a recipe you can actually make.
          </p>
          
          <div className="relative mb-6">
            <textarea 
              rows="3" 
              placeholder="strawberries, yogurt, honey..." 
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              className="w-full bg-[#F0E6D1] rounded-xl py-4 px-6 text-black placeholder-black/60 text-lg md:text-xl font-medium focus:outline-none focus:ring-4 focus:ring-[#B5D098] transition-all resize-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setRecipeInput(chip.text)}
                className="chip bg-[#839705] hover:bg-[#95A131] text-white px-5 py-2 rounded-full text-base md:text-lg font-semibold transition-all"
              >
                <i className={`fas ${chip.icon} mr-2`}></i> {chip.text}
              </button>
            ))}
          </div>
          
          <p className="text-[#F0E6D1]/80 text-sm md:text-base mb-6">
            <i className="fas fa-info-circle mr-1"></i> Use ingredients, constraints, servings, or tap a chip and let FoodGPT guide the next step.
          </p>
          
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-[#95A131] hover:bg-[#839705] transition-all duration-200 rounded-xl px-8 md:px-10 py-3 md:py-4 flex items-center gap-3 shadow-lg hover:scale-105 disabled:opacity-50"
          >
            <i className="fas fa-wand-magic text-white text-xl md:text-2xl"></i>
            <span className="text-white font-bold text-xl md:text-2xl">Create Recipe →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeSection;  // ← MAKE SURE THIS IS AT THE BOTTOM!