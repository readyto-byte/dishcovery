import { useState } from 'react';
import { apiCall } from '../../api/config';

const RecipeCard = ({ recipeData, isLoading }) => {

  const [favAdded, setFavAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const addToFavorites = async () => {
    if (!recipeData?.id) {
      console.error('Cannot favorite recipe without recipe id');
      return;
    }

    try {
      await apiCall('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ recipe_id: recipeData.id }),
      });
      setFavAdded(true);
      setTimeout(() => setFavAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `${recipeData.title}\n\nIngredients:\n${recipeData.ingredients.join('\n')}\n\nInstructions:\n${recipeData.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColor = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-red-400',
  }[recipeData?.difficulty?.toLowerCase()] || 'text-emerald-400';

  if (isLoading) {
    return (
      <div className="mx-4 md:mx-8">
        <div className="rounded-3xl border border-[#d6e8c0] shadow-xl p-14 flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}>
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#587A34]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#587A34] animate-spin"></div>
          </div>
          <p className="text-[#3a5220] text-lg font-semibold tracking-wide">Cooking up something delicious…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-8">
      <div className="rounded-3xl overflow-hidden shadow-xl border border-[#d6e8c0]" style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}>

        <div className="relative px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #587A34 0%, #3a5220 100%)' }}>
          <div className="relative">

            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-[#B5D098]"></div>
              <span className="text-[#B5D098] text-[10px] font-semibold uppercase tracking-[0.15em]">Classic Recipe</span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-[#F0E6D1] leading-tight tracking-tight mb-3">
              {recipeData.title}
            </h3>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: 'fa-kitchen-set', label: 'Prep', value: recipeData.prepTime },
                { icon: 'fa-clock', label: 'Cook', value: recipeData.cookTime },
                { icon: 'fa-users', label: 'Serves', value: recipeData.servings },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                  <i className={`fas ${icon} text-[#B5D098] text-xs`}></i>
                  <span className="text-[#F0E6D1]/60 text-[11px]">{label}</span>
                  <span className="text-[#F0E6D1] text-[11px] font-bold">{value}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                <i className="fas fa-chart-simple text-[#B5D098] text-xs"></i>
                <span className="text-[#F0E6D1]/60 text-[11px]">Difficulty</span>
                <span className={`text-[11px] font-bold capitalize ${difficultyColor}`}>{recipeData.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">

          <p className="text-[#3a5220]/80 text-sm leading-relaxed border-l-2 border-[#587A34]/30 pl-3">
            {recipeData.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {recipeData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#587A34]/30 text-[#587A34] tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

                    {recipeData.nutritionalInfo && (
            <div className="rounded-xl p-4 bg-white/60 border border-[#d6e8c0]">
              <h4 className="text-[#2d3f1a] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#587A34]/15 flex items-center justify-center">
                  <i className="fas fa-fire text-[#587A34] text-[10px]"></i>
                </span>
                Nutritional Info <span className="text-[#3a5220]/50 font-normal text-xs">(per serving)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Calories', value: recipeData.nutritionalInfo.calories, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
                  { label: 'Protein',  value: recipeData.nutritionalInfo.protein,  color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-100' },
                  { label: 'Carbs',    value: recipeData.nutritionalInfo.carbs,    color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
                  { label: 'Fat',      value: recipeData.nutritionalInfo.fat,      color: 'text-orange-700',bg: 'bg-orange-50',border: 'border-orange-100' },
                  { label: 'Fiber',    value: recipeData.nutritionalInfo.fiber,    color: 'text-purple-700',bg: 'bg-purple-50',border: 'border-purple-100' },
                ].map(({ label, value, color, bg, border }) => value != null && (
                  <div key={label} className={`flex flex-col items-center justify-center rounded-lg px-2 py-2 border ${bg} ${border}`}>
                    <span className={`font-extrabold text-sm ${color}`}>{value}</span>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="h-px bg-gradient-to-r from-transparent via-[#587A34]/20 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <div className="rounded-xl p-4 bg-white/60 border border-[#d6e8c0]">
              <h4 className="text-[#2d3f1a] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#587A34]/15 flex items-center justify-center">
                  <i className="fas fa-shopping-basket text-[#587A34] text-[10px]"></i>
                </span>
                Ingredients
              </h4>
              <ul className="space-y-1.5">
                {recipeData.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#3a5220]/80 text-xs leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-[#587A34]/50 shrink-0"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl p-4 bg-white/60 border border-[#d6e8c0]">
              <h4 className="text-[#2d3f1a] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#587A34]/15 flex items-center justify-center">
                  <i className="fas fa-list-ol text-[#587A34] text-[10px]"></i>
                </span>
                Instructions
              </h4>
              <ol className="space-y-2">
                {recipeData.instructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-2 text-xs leading-relaxed text-[#3a5220]/80">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[#587A34] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#587A34]/20 to-transparent" />

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={addToFavorites}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm cursor-pointer"
              style={{ background: favAdded ? '#3a5220' : '#587A34', color: '#F0E6D1' }}
            >
              <i className={`${favAdded ? 'fas' : 'far'} fa-heart text-xs`}></i>
              {favAdded ? 'Saved!' : 'Add to Favorites'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs border border-[#587A34]/30 text-[#587A34] hover:bg-[#587A34]/10 transition-all duration-200 cursor-pointer ml-auto"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecipeCard;