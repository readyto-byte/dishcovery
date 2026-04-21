import { useState, useRef, useEffect } from 'react';

const INITIAL_CHIPS = [
  {
    label: 'High protein dinner',
    fill: 'High protein dinner',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
        <path d="M8 2v12M5 5.5C5 4 6 3 8 3s3 1 3 2.5-1.5 3-3 3c-2 0-3 1-3 2.5S6 13 8 13s3-1 3-2.5" />
      </svg>
    ),
  },
  {
    label: 'Quick lunch',
    fill: 'Quick lunch under 20 minutes',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
        <circle cx="8" cy="8" r="5.5" /><path d="M8 5.5V8l2 1.5" />
      </svg>
    ),
  },
  {
    label: 'Budget meal',
    fill: 'Budget meal under $10',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
        <circle cx="8" cy="8" r="5.5" /><path d="M8 5v6M6.5 6.5h2a1 1 0 010 2h-1a1 1 0 000 2H10" />
      </svg>
    ),
  },
  {
    label: 'Vegetarian',
    fill: 'Vegetarian dish',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
        <path d="M4 13c0-4 2-7 4-9M12 4c-2 1-4 3-5 5M8 5c1 2 2 5 2 8" />
      </svg>
    ),
  },
];

const FOLLOW_UP_CHIPS = [
  { label: 'Make it spicier',        fill: 'Make it spicier' },
  { label: 'Reduce calories',        fill: 'Reduce the calories' },
  { label: 'Add more protein',       fill: 'Add more protein' },
  { label: 'Make it vegan',          fill: 'Make it vegan' },
  { label: 'Shorter cook time',      fill: 'Shorten the cook time' },
  { label: 'Substitute ingredients', fill: 'Suggest ingredient substitutions' },
];

const CreateRecipeSection = ({ onGenerate, isLoading, aiResponse, onReset }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (aiResponse && history.length > 0 && history[history.length - 1]?.role === 'user') {

      setHistory(prev => {
        const newHistory = [
          ...prev,
          { role: 'assistant', content: `${aiResponse.headline}. ${aiResponse.summary}` },
        ];

        return newHistory.slice(-4);
      });
    }
  }, [aiResponse]);

  const isAnswered = !!aiResponse;
  const isFollowUp = history.length > 0;

  const fillChip = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const handleGenerate = () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const newUserMessage = { role: 'user', content: prompt };

    const updatedHistory = [...history, newUserMessage].slice(-4);

    setHistory(updatedHistory);
    setInput('');
    onGenerate?.(prompt, updatedHistory);
  };

  const handleReset = () => {
    setHistory([]);
    setInput('');
    onReset?.();
  };

  const renderHeaderContent = () => {
    if (isLoading) {
      return (
        <>
          <p className="text-2xl md:text-3xl font-bold leading-snug mb-2 animate-pulse" style={{ color: '#F0E6D1' }}>
            Working on your recipe…
          </p>
          <p className="text-sm font-light" style={{ color: 'rgba(240,230,209,0.6)' }}>
            Hang tight while Dishcovery cooks something up.
          </p>
        </>
      );
    }

    if (isAnswered) {
      return (
        <>
          <p className="text-2xl md:text-3xl font-bold leading-snug mb-2" style={{ color: '#F0E6D1' }}>
            {aiResponse.headline}
          </p>
          <p className="text-sm leading-relaxed font-light max-w-lg" style={{ color: 'rgba(240,230,209,0.75)' }}>
            {aiResponse.summary}
          </p>
        </>
      );
    }

    return (
      <>
        <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-2" style={{ color: '#F0E6D1' }}>
          What do you want to cook today?
        </h2>
        <p className="text-sm leading-relaxed font-light max-w-lg" style={{ color: 'rgba(240,230,209,0.7)' }}>
          Share an idea, ingredients, or a cooking goal — Dishcovery will turn it into a recipe you can actually make.
        </p>
      </>
    );
  };

  return (
    <div className="mx-4 md:mx-8 mb-8">

      <div
        className="rounded-t-2xl px-6 md:px-8 pt-6 pb-7"
        style={{ background: 'linear-gradient(135deg, #587A34 0%, #3a5220 100%)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(181,208,152,0.2)' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#B5D098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M11 2l3 3-8 8H3v-3l8-8z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#B5D098' }}>
            {isAnswered && isFollowUp ? 'Follow-up' : 'Create a Recipe'}
          </span>
        </div>

        {renderHeaderContent()}
      </div>

      <div
        className="rounded-b-2xl px-6 md:px-8 pt-6 pb-6 shadow-lg"
        style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)', border: '1px solid #d6e8c0', borderTop: 'none' }}
      >

        {isAnswered && (
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'transparent', border: '1.5px solid #B5D098', color: '#587A34' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88,122,52,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3 h-3">
                <path d="M3 8h10M8 3l5 5-5 5" />
              </svg>
              New recipe
            </button>
            <span className="text-[11px] font-medium" style={{ color: '#587A34' }}>
              Ask a follow-up about this recipe
            </span>
          </div>
        )}

        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            rows={3}
            placeholder={isAnswered ? 'e.g. Make it dairy-free, reduce calories…' : 'e.g. strawberries, yogurt, honey...'}
            value={input}
            maxLength={300}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="w-full rounded-xl py-4 px-5 text-sm font-light resize-none outline-none transition-all disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid #B5D098',
              color: '#1B2A0A',
              boxShadow: '0 1px 4px rgba(88,122,52,0.08)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#587A34';
              e.target.style.boxShadow = '0 0 0 3px rgba(88,122,52,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#B5D098';
              e.target.style.boxShadow = '0 1px 4px rgba(88,122,52,0.08)';
            }}
          />
          <span className="absolute bottom-3 right-4 text-[10px]" style={{ color: '#839705' }}>
            {input.length}/300
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {(isAnswered ? FOLLOW_UP_CHIPS : INITIAL_CHIPS).map((chip) => (
            <button
              key={chip.label}
              onClick={() => fillChip(chip.fill)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 disabled:opacity-40"
              style={{ background: '#587A34', border: '1px solid #3a5220', color: '#F0E6D1' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3a5220'; e.currentTarget.style.borderColor = '#1e3010'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#587A34'; e.currentTarget.style.borderColor = '#3a5220'; }}
            >
              {chip.icon ?? null}
              {chip.label}
            </button>
          ))}
        </div>

        <div className="mb-5" style={{ height: '1px', background: '#B5D098' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] flex items-start gap-1.5 leading-relaxed" style={{ color: '#587A34' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3 h-3 mt-0.5 shrink-0">
              <circle cx="8" cy="8" r="5.5" /><path d="M8 7.5v3M8 5.5v.5" />
            </svg>
            {isAnswered
              ? 'Got a follow-up? Refine the recipe or start fresh with a new one.'
              : 'Use ingredients, constraints, servings, or tap a chip. Press Create Recipe to generate.'}
          </p>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #587A34 0%, #3a5220 100%)',
              color: '#F0E6D1',
              boxShadow: '0 2px 10px rgba(88,122,52,0.35)',
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M2 8h9M8 5l3 3-3 3" />
                </svg>
                {isAnswered ? 'Ask Follow-up' : 'Create Recipe'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateRecipeSection;