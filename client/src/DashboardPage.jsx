import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiCall } from "./api/config.js";
import Sidebar from "./components/Dashboard/Sidebar";
import DashboardNavbar from "./components/Dashboard/DashboardNavbar";
import WelcomeBanner from "./components/Dashboard/WelcomeBanner";
import CreateRecipeSection from "./components/Dashboard/CreateRecipeSection";
import RecipeCard from "./components/Dashboard/RecipeCard";
import MealPlanPage from "./components/Dashboard/MealPlanPage";
import HistoryPage from "./components/Dashboard/HistoryPage";
import ProfilePage from "./components/Dashboard/ProfilePage";
import SettingsPage from "./components/Dashboard/SettingsPage";
import FavoritesPage from "./components/Dashboard/FavoritesPage";


const getRecipeErrorMessage = (error) => {
  const fallback = "Failed to generate recipe. Please try again.";
  const rawMessage = typeof error?.message === "string" ? error.message : "";
  const parseErrorPayload = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return null;
    try { return JSON.parse(value); } catch { return null; }
  };
  const parsed = parseErrorPayload(rawMessage);
  const errorPayload = parsed?.error || parsed;
  const serviceMessage =
    errorPayload?.message ||
    parsed?.message ||
    (typeof rawMessage === "string" ? rawMessage : "");
  const status = errorPayload?.status || parsed?.status || "";
  if (status === "UNAVAILABLE" || /high demand|try again later|UNAVAILABLE/i.test(serviceMessage)) {
    return "Dishcovery AI is busy right now. Please try again in a moment.";
  }
  if (serviceMessage && serviceMessage.trim().length > 0) return serviceMessage;
  return fallback;
};

const pickSuggestion = (suggestions, currentTitle) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;
  const normalizedCurrentTitle = String(currentTitle || "").trim().toLowerCase();
  const uniqueSuggestions = suggestions.filter((item, index, arr) => {
    const title = String(item?.title || "").trim().toLowerCase();
    return arr.findIndex((candidate) => String(candidate?.title || "").trim().toLowerCase() === title) === index;
  });
  const candidates = uniqueSuggestions.filter(
    (item) => String(item?.title || "").trim().toLowerCase() !== normalizedCurrentTitle
  );
  const pool = candidates.length > 0 ? candidates : uniqueSuggestions;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] || null;
};


const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />

          <div className="px-7 pt-6 pb-4 shrink-0" style={{ background: 'linear-gradient(135deg, #32491B 0%, #587A34 100%)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B5D098]/30 text-[#B5D098] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {recipe.type || 'Recipe'}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    recipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300'
                    : recipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                  }`}>
                    {recipe.difficulty || 'Medium'}
                  </span>
                </div>
                <h2 className="text-[#F0E6D1] font-extrabold text-xl md:text-2xl leading-tight">{recipe.title}</h2>
                <div className="flex gap-4 mt-3 text-[#B5D098] text-sm">
                  <span><i className="far fa-clock mr-1"></i>{recipe.time || recipe.prepTime || '—'}</span>
                  <span><i className="fas fa-users mr-1"></i>{recipe.servings} servings</span>
                  {recipe.viewed && <span><i className="far fa-eye mr-1"></i>Viewed {recipe.viewed}</span>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F0E6D1] transition-all cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Array.isArray(recipe.tags) && recipe.tags.map((tag, idx) => (
                <span key={idx} className="bg-[#B5D098]/20 text-[#B5D098] px-2 py-0.5 rounded-full text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">
            {recipe.description && (
              <p className="text-[#4a5e30] text-sm leading-relaxed italic border-l-4 border-[#B5D098] pl-4">
                {recipe.description}
              </p>
            )}
            <div>
              <h3 className="text-[#32491B] font-bold text-base mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#32491B] flex items-center justify-center">
                  <i className="fas fa-list text-[#F0E6D1] text-xs"></i>
                </div>
                Ingredients
              </h3>
              <ul className="space-y-2">
                {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#2d3f1a]">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#839705] shrink-0"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent" />
            <div>
              <h3 className="text-[#32491B] font-bold text-base mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#32491B] flex items-center justify-center">
                  <i className="fas fa-tasks text-[#F0E6D1] text-xs"></i>
                </div>
                Instructions
              </h3>
              <ol className="space-y-3">
                {Array.isArray(recipe.instructions) && recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#2d3f1a]">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#32491B] text-[#F0E6D1] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="px-7 py-4 shrink-0 border-t border-[#B5D098]/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


const LogoutConfirmModal = ({ onConfirm, onCancel, isLoggingOut }) => (
  <>
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
      onClick={!isLoggingOut ? onCancel : undefined}
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #32491B, #839705, #B5D098)' }} />
        <div className="px-7 pt-7 pb-6">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#32491B]/10 flex items-center justify-center shadow-inner">
              {isLoggingOut ? (
                <svg className="animate-spin w-6 h-6 text-[#32491B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <i className="fas fa-sign-out-alt text-[#32491B] text-xl"></i>
              )}
            </div>
          </div>
          <h2 className="text-center font-bold text-[#1B211A] text-xl mb-2 tracking-tight">
            {isLoggingOut ? 'Logging out...' : 'Leaving so soon?'}
          </h2>
          <p className="text-center text-[#4a5e30] text-sm leading-relaxed mb-7">
            {isLoggingOut
              ? 'Please wait while we sign you out.'
              : <>Are you sure you want to log out of <span className="font-semibold text-[#32491B]">Dishcovery</span>?</>}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              Stay
            </button>
            <button onClick={onConfirm} disabled={isLoggingOut}
              className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm tracking-wide transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);


const DIETARY_OPTIONS = ["Keto", "Gluten-Free", "Vegan", "Vegetarian", "Paleo", "Dairy-Free"];
const ALLERGY_OPTIONS = ["Nuts", "Shellfish", "Eggs", "Soy", "Wheat", "Fish"];

const FTAvatar = ({ name, avatar }) => {
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (avatar) {
    return <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-[#B5D098]" />;
  }
  return (
    <div className="w-20 h-20 rounded-full bg-[#3a5220] flex items-center justify-center text-[#F0E6D1] font-bold text-2xl shadow-lg">
      {initials}
    </div>
  );
};

const FTAvatarSmall = ({ name, avatar }) => {
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (avatar) {
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-[#B5D098]" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#3a5220] flex items-center justify-center text-[#F0E6D1] font-bold text-sm">
      {initials}
    </div>
  );
};

const FTAvatarUpload = ({ name, avatar, onAvatarChange }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAvatarChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <FTAvatar name={name} avatar={avatar} />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-1.5 rounded-full bg-[#587A34]/20 text-[#3a5220] text-xs font-semibold hover:bg-[#587A34]/30 transition-colors border border-[#587A34]/30"
      >
        {avatar ? "Change Photo" : "Upload Photo"}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

const StepDots = ({ total, current }) => (
  <div className="flex items-center gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current ? "w-6 h-2 bg-[#B5D098]" : i < current ? "w-2 h-2 bg-[#B5D098]/60" : "w-2 h-2 bg-white/20"
        }`}
      />
    ))}
  </div>
);

const FTTagButton = ({ label, selected, onClick, variant = "green" }) => {
  const variants = {
    green: selected
      ? "bg-[#587A34] text-white border-[#587A34]"
      : "bg-white text-[#587A34] border-[#587A34]/40 hover:border-[#587A34]",
    red: selected
      ? "bg-red-500 text-white border-red-500"
      : "bg-white text-red-500 border-red-300 hover:border-red-500",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${variants[variant]}`}
    >
      {label}
    </button>
  );
};

const TOTAL_FT_STEPS = 4;

const FirstTimeProfileModal = ({ onComplete, isSaving }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [dietary, setDietary] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("forward");

  const toggleItem = (list, setList, val) =>
    setList((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const goNext = () => {
    if (step === 1) {
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (!dateOfBirth) { setError("Please enter your date of birth."); return; }
    }
    setError("");
    setDirection("forward");
    setAnimating(true);
    setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 180);
  };

  const goBack = () => {
    setError("");
    setDirection("back");
    setAnimating(true);
    setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 180);
  };

  const handleFinish = () => {
    if (!name.trim()) { setStep(1); setError("Please enter your name."); return; }
    onComplete({ name: name.trim(), dateOfBirth, avatar, dietaryRestrictions: dietary, allergies });
  };

  const slideClass = animating
    ? direction === "forward" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-3 sm:p-4">
        <div
          className="w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          style={{ background: "linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)" }}
        >

          <div className="h-1.5 w-full shrink-0" style={{ background: "linear-gradient(90deg, #32491B, #839705, #B5D098)" }} />

          <div className="px-5 sm:px-7 pt-4 sm:pt-5 pb-4 shrink-0" style={{ background: "linear-gradient(135deg, #32491B 0%, #587A34 100%)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#B5D098]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[#F0E6D1] font-extrabold text-lg leading-tight">Set Up Your Profile</h2>
              </div>
            </div>
            <p className="text-[#B5D098]/80 text-xs mt-1.5 leading-relaxed hidden sm:block">
              Help us personalize your recipe recommendations by creating your profile.
            </p>
            <div className="mt-4">
              <StepDots total={TOTAL_FT_STEPS} current={step} />
            </div>
          </div>

          <div className="px-5 sm:px-7 py-4 sm:py-5 flex-1 overflow-y-auto min-h-0">
            <div className={`transition-all duration-180 ${slideClass}`}>

              {step === 0 && (
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div>
                    <h3 className="text-[#2d3f1a] font-extrabold text-lg mb-1">Welcome!</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed">
                      First time here? Let's set up your profile so we can suggest recipes tailored just for you.
                    </p>
                  </div>
                  <div className="w-full bg-[#B5D098]/30 rounded-xl p-3 text-left space-y-2">
                    {[
                      { icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#32491B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ), text: "Your name & birthday" },
                      { icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#32491B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ), text: "Dietary restrictions" },
                      { icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#32491B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                      ), text: "Allergies & sensitivities" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-[#32491B]">
                        <span className="shrink-0">{icon}</span>
                        <span className="font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <FTAvatarUpload name={name} avatar={avatar} onAvatarChange={setAvatar} />
                  <div>
                    <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      placeholder="What should we call you?"
                      className="w-full bg-white border border-[#587A34]/30 rounded-xl px-4 py-2.5 text-[#3a5220] text-sm focus:outline-none focus:ring-2 focus:ring-[#587A34]/50 placeholder:text-[#3a5220]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => { setDateOfBirth(e.target.value); setError(""); }}
                      className="w-full bg-white border border-[#587A34]/30 rounded-xl px-4 py-2.5 text-[#3a5220] text-sm focus:outline-none focus:ring-2 focus:ring-[#587A34]/50"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-bold text-base mb-1">Dietary Restrictions</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed mb-4">
                      Select any that apply — we'll avoid ingredients that don't match your diet.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => (
                        <FTTagButton key={opt} label={opt} selected={dietary.includes(opt)} onClick={() => toggleItem(dietary, setDietary, opt)} variant="green" />
                      ))}
                    </div>
                  </div>
                  {dietary.length === 0 ? (
                    <div className="rounded-xl bg-[#B5D098]/20 border border-[#B5D098]/50 px-4 py-3 text-xs text-[#4a5e30]">
                      No restrictions? No problem — you can skip this step.
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#587A34]/10 px-4 py-3 text-xs text-[#3a5220]">
                      <span className="font-semibold">Selected: </span>{dietary.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-bold text-base mb-1">Allergies & Sensitivities</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed mb-4">
                      We'll make sure to flag or exclude recipes containing these allergens.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGY_OPTIONS.map((opt) => (
                        <FTTagButton key={opt} label={opt} selected={allergies.includes(opt)} onClick={() => toggleItem(allergies, setAllergies, opt)} variant="red" />
                      ))}
                    </div>
                  </div>
                  {allergies.length > 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
                      <span className="font-semibold">Allergic to: </span>{allergies.join(", ")}
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#B5D098]/40 bg-[#32491B]/5 px-4 py-4 space-y-2">
                    <p className="text-[#32491B] text-xs font-bold uppercase tracking-wider mb-2">Profile Summary</p>
                    <div className="flex items-center gap-3">
                      <FTAvatarSmall name={name || "?"} avatar={avatar} />
                      <div>
                        <p className="text-[#2d3f1a] font-semibold text-sm">{name || "—"}</p>
                        <p className="text-[#4a5e30] text-xs">{dateOfBirth || "No birthday set"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}
          </div>

          <div className="px-5 sm:px-7 pb-4 sm:pb-5 pt-2 shrink-0 border-t border-[#B5D098]/30">
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm transition-all cursor-pointer disabled:opacity-40"
                >
                  Back
                </button>
              )}
              {step < TOTAL_FT_STEPS - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  {step === 0 ? "Let's Go" : "Next"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : "Finish & Start Cooking"}
                </button>
              )}
            </div>
            {(step === 2 || step === 3) && (
              <button
                type="button"
                onClick={step === TOTAL_FT_STEPS - 1 ? handleFinish : goNext}
                disabled={isSaving}
                className="w-full mt-2 text-center text-xs text-[#4a5e30]/60 hover:text-[#4a5e30] transition-colors py-1 cursor-pointer"
              >
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recipeError, setRecipeError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [selectedHistoryRecipe, setSelectedHistoryRecipe] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);

  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

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

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const response = await apiCall("/api/profiles");
        const profiles = Array.isArray(response?.data) ? response.data : [];
        if (profiles.length === 0) {
          setShowFirstTimeModal(true);
        }
      } catch (err) {

        console.error("Failed to check profiles on mount:", err);
      }
    };
    checkFirstTimeUser();
  }, []);

  const handleFirstTimeProfileComplete = async (profileData) => {
    setIsCreatingProfile(true);
    try {
      await apiCall("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          name: profileData.name,
          dateOfBirth: profileData.dateOfBirth,
          avatar_url: profileData.avatar,
          dietaryRestrictions: profileData.dietaryRestrictions,
          allergies: profileData.allergies,
          isDefault: true,
        }),
      });
      setShowFirstTimeModal(false);
      setActiveProfile({ name: profileData.name, avatar: profileData.avatar });
    } catch (err) {
      console.error("Failed to create first-time profile:", err);
      // Dismiss anyway so the user isn't stuck
      setShowFirstTimeModal(false);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const generateRecipe = async (userInput) => {
    setIsLoading(true);
    setRecipeError("");
    try {
      const profilesResponse = await apiCall("/api/profiles");
      const profiles = Array.isArray(profilesResponse?.data) ? profilesResponse.data : [];
      const selectedProfile = profiles.find((profile) => profile?.is_active) || profiles[0] || null;
      const normalizedProfiles = selectedProfile
        ? [
            {
              id: selectedProfile.id,
              name: selectedProfile.name,
              dietary_restrictions: Array.isArray(selectedProfile.dietary_restrictions)
                ? selectedProfile.dietary_restrictions : [],
              dietary_preferences: Array.isArray(selectedProfile.dietary_preferences)
                ? selectedProfile.dietary_preferences : [],
            },
          ]
        : [];
      const normalizedPrompt = String(userInput || "").trim().toLowerCase();
      const avoidTitles = recipeData?.title ? [recipeData.title] : [];

      const response = await apiCall("/api/recipes", {
        method: "POST",
        body: JSON.stringify({
          profiles: normalizedProfiles,
          conversation: [{ role: "user", content: userInput }],
          searchQuery: userInput,
          bypassCache: true,
          avoidTitles,
        }),
      });
      const suggestions = response?.response?.suggestions;
      const suggestion = pickSuggestion(suggestions, recipeData.title);
      if (!suggestion) throw new Error("Gemini returned no recipe suggestions.");
      const totalTimeFromApi = response?.response?.estimatedTime;
      const prepFromApi = suggestion.prepTimeMin ?? suggestion.prep_time_min;
      const cookFromApi = suggestion.cookTimeMin ?? suggestion.cook_time_min;
      setRecipeData({
        title: suggestion.title || "Generated Recipe",
        description: suggestion.description || response?.response?.message || "Generated by Gemini.",
        prepTime: prepFromApi ? `${prepFromApi} min` : totalTimeFromApi || "15 min",
        cookTime: cookFromApi ? `${cookFromApi} min` : "20 min",
        servings: suggestion.servings ? String(suggestion.servings) : "2",
        difficulty: "medium",
        tags: ["gemini ai", "personalized", "recommended"],
        ingredients: Array.isArray(suggestion.keyIngredients) ? suggestion.keyIngredients : [],
        instructions: Array.isArray(suggestion.instructions) ? suggestion.instructions : [],
      });
      setLastPrompt(normalizedPrompt);
    } catch (error) {
      setRecipeError(getRecipeErrorMessage(error));
    } finally {
      setHasGenerated(true);
      setIsLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <WelcomeBanner />
            {recipeError && (
              <div className="mx-4 md:mx-8 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {recipeError}
              </div>
            )}
            <CreateRecipeSection onGenerate={generateRecipe} isLoading={isLoading} />
            {(hasGenerated || isLoading) && (
              <RecipeCard recipeData={recipeData} isLoading={isLoading} />
            )}
          </>
        );
      case 'meal-plan':
        return <MealPlanPage onViewRecipe={setSelectedHistoryRecipe} />;
      case 'history':
        return <HistoryPage onViewRecipe={setSelectedHistoryRecipe} />;
      case 'profile':
        return <ProfilePage onActiveProfileChange={setActiveProfile} />;
      case 'settings':
        return <SettingsPage />;
      case 'favorites':
        return <FavoritesPage onViewRecipe={setSelectedHistoryRecipe} />;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#B5D098]">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main
        style={{ marginLeft: sidebarOpen ? '272px' : '0' }}
        className="transition-all duration-300 min-h-screen"
      >
        <DashboardNavbar
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeProfile={activeProfile}
        />
        <div className="pb-12">{renderPage()}</div>
      </main>

      {selectedHistoryRecipe && (
        <RecipeDetailModal
          recipe={selectedHistoryRecipe}
          onClose={() => setSelectedHistoryRecipe(null)}
        />
      )}

      {(showLogoutConfirm || isLoggingOut) && (
        <LogoutConfirmModal
          onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
          isLoggingOut={isLoggingOut}
        />
      )}

      {showFirstTimeModal && (
        <FirstTimeProfileModal
          onComplete={handleFirstTimeProfileComplete}
          isSaving={isCreatingProfile}
        />
      )}
    </div>
  );
};

export default DashboardPage;