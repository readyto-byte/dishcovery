import { useState } from 'react';

const RecipeOptionsGrid = ({ options, onSelectOption, isLoading }) => {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#587A34';
    }
  };

  return (
    <div className="mx-4 md:mx-8 mb-8">
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ 
          background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)',
          border: '1px solid #d6e8c0'
        }}
      >
        
        <div
          className="rounded-t-2xl px-6 md:px-8 pt-6 pb-7"
          style={{ background: 'linear-gradient(135deg, #587A34 0%, #3a5220 100%)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(181,208,152,0.2)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="#B5D098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M2 8h12M8 2v12" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#B5D098' }}>
              Choose Your Style
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-2" style={{ color: '#F0E6D1' }}>
            Select a recipe variation
          </h2>
          <p className="text-sm leading-relaxed font-light max-w-lg" style={{ color: 'rgba(240,230,209,0.7)' }}>
            {options.length} delicious options to choose from
          </p>
        </div>

        <div
          className="rounded-b-2xl px-6 md:px-8 pt-6 pb-6"
          style={{ border: '1px solid #d6e8c0', borderTop: 'none' }}
        >
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {options.map((option, idx) => (
              <div
                key={idx}
                className="rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer group"
                style={{ 
                  background: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid #B5D098',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#587A34';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88,122,52,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#B5D098';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => !isLoading && onSelectOption(option)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-base leading-tight" style={{ color: '#1B2A0A' }}>
                      {option.title}
                    </h4>
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded-full ml-2 flex-shrink-0"
                      style={{ 
                        background: `${getDifficultyColor(option.difficulty)}15`,
                        color: getDifficultyColor(option.difficulty),
                        border: `1px solid ${getDifficultyColor(option.difficulty)}30`
                      }}
                    >
                      {option.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-sm text-black/70 mb-4 leading-relaxed line-clamp-2">
                    {option.description.length > 100 
                      ? option.description.substring(0, 100) + '...' 
                      : option.description}
                  </p>
                  
                  <div className="flex gap-4 text-sm text-black/60 mb-4 pb-3 border-b" style={{ borderColor: '#B5D098' }}>
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                        <circle cx="8" cy="8" r="5.5" />
                        <path d="M8 5.5V8l2 1.5" />
                      </svg>
                      {option.cookTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                        <path d="M8 2v12M5 5.5C5 4 6 3 8 3s3 1 3 2.5-1.5 3-3 3c-2 0-3 1-3 2.5S6 13 8 13s3-1 3-2.5" />
                      </svg>
                      {option.estimatedCostPhp != null ? `₱${option.estimatedCostPhp}` : "-"}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {option.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: '#E8F0E0', color: '#587A34' }}
                        >
                          {typeof ingredient === 'string' ? ingredient.substring(0, 18) : ingredient}
                          {typeof ingredient === 'string' && ingredient.length > 18 ? '...' : ''}
                        </span>
                      ))}
                      {option.ingredients.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#E8F0E0', color: '#587A34' }}>
                          +{option.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOption(option);
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #587A34 0%, #3a5220 100%)',
                      color: '#F0E6D1',
                      boxShadow: '0 2px 10px rgba(88,122,52,0.35)',
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M2 8h9M8 5l3 3-3 3" />
                    </svg>
                    Select This Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6" style={{ height: '1px', background: '#B5D098' }} />
          
          <p className="text-[11px] flex items-start gap-1.5 leading-relaxed mt-4" style={{ color: '#587A34' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3 h-3 mt-0.5 shrink-0">
              <circle cx="8" cy="8" r="5.5" /><path d="M8 7.5v3M8 5.5v.5" />
            </svg>
            Pick the recipe that inspires you most — then ask follow-ups to refine it further.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeOptionsGrid;