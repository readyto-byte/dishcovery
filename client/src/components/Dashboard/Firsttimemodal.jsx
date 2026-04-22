import { useState, useRef, useEffect } from "react";

const DIETARY_OPTIONS = ["Keto", "Gluten-Free", "Vegan", "Vegetarian", "Paleo", "Dairy-Free"];
const ALLERGY_OPTIONS = ["Nuts", "Shellfish", "Eggs", "Soy", "Wheat", "Fish"];

/* ── Avatar ── */
const Avatar = ({ name, avatar, size = "lg" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizeClass = size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shadow-lg border-4 border-[#B5D098]`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-[#3a5220] flex items-center justify-center text-[#F0E6D1] font-bold shadow-lg`}>
      {initials}
    </div>
  );
};

/* ── Avatar Upload ── */
const AvatarUpload = ({ name, avatar, onAvatarChange }) => {
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
        <Avatar name={name || "?"} avatar={avatar} size="lg" />
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

/* ── Tag Toggle Button ── */
const TagButton = ({ label, selected, onClick, variant = "green" }) => {
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
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${variants[variant]}`}
    >
      {label}
    </button>
  );
};

/* ── Step Indicator ── */
const StepDots = ({ total, current }) => (
  <div className="flex items-center gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current
            ? "w-6 h-2 bg-[#587A34]"
            : i < current
            ? "w-2 h-2 bg-[#B5D098]"
            : "w-2 h-2 bg-[#587A34]/20"
        }`}
      />
    ))}
  </div>
);

/* ── Main Modal ── */
const FirstTimeProfileModal = ({ onComplete, isSaving = false }) => {
  const [step, setStep] = useState(0); // 0: welcome, 1: basic info, 2: dietary, 3: allergies
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [dietary, setDietary] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("forward");

  const TOTAL_STEPS = 4;

  const toggleItem = (list, setList, val) => {
    setList((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
  };

  const goNext = () => {
    if (step === 1) {
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (!dateOfBirth) { setError("Please enter your date of birth."); return; }
    }
    setError("");
    setDirection("forward");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 180);
  };

  const goBack = () => {
    setError("");
    setDirection("back");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 180);
  };

  const handleFinish = () => {
    if (!name.trim()) { setStep(1); setError("Please enter your name."); return; }
    onComplete({ name: name.trim(), dateOfBirth, avatar, dietaryRestrictions: dietary, allergies });
  };

  const slideClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)" }}
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full shrink-0" style={{ background: "linear-gradient(90deg, #32491B, #839705, #B5D098)" }} />

          {/* Header */}
          <div className="px-7 pt-6 pb-5 shrink-0" style={{ background: "linear-gradient(135deg, #32491B 0%, #587A34 100%)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#B5D098]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#B5D098] text-xs font-semibold uppercase tracking-widest">Welcome to Dishcovery</p>
                <h2 className="text-[#F0E6D1] font-extrabold text-lg leading-tight">Set Up Your Profile</h2>
              </div>
            </div>
            <p className="text-[#B5D098]/80 text-xs mt-2 leading-relaxed">
              Help us personalize your recipe recommendations by creating your profile.
            </p>
            <div className="mt-4">
              <StepDots total={TOTAL_STEPS} current={step} />
            </div>
          </div>

          {/* Step Content */}
          <div className="px-7 py-6 flex-1 overflow-y-auto">
            <div className={`transition-all duration-180 ${slideClass}`}>

              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center gap-5 py-4">
                  <div className="w-20 h-20 rounded-3xl bg-[#32491B]/10 flex items-center justify-center shadow-inner">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <div>
                    <h3 className="text-[#2d3f1a] font-extrabold text-xl mb-2">Hello, Chef!</h3>
                    <p className="text-[#4a5e30] text-sm leading-relaxed">
                      It looks like this is your first time here. Let's take a moment to create your profile so we can suggest recipes tailored just for you.
                    </p>
                  </div>
                  <div className="w-full bg-[#B5D098]/30 rounded-2xl p-4 text-left space-y-2">
                    {[
                      { icon: "👤", text: "Your name & birthday" },
                      { icon: "🥗", text: "Dietary restrictions" },
                      { icon: "⚠️", text: "Allergies & sensitivities" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-[#32491B]">
                        <span className="text-base">{icon}</span>
                        <span className="font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <AvatarUpload name={name} avatar={avatar} onAvatarChange={setAvatar} />

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

              {/* Step 2: Dietary Restrictions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-bold text-base mb-1">Dietary Restrictions</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed mb-4">
                      Select any that apply — we'll avoid ingredients that don't match your diet.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => (
                        <TagButton
                          key={opt}
                          label={opt}
                          selected={dietary.includes(opt)}
                          onClick={() => toggleItem(dietary, setDietary, opt)}
                          variant="green"
                        />
                      ))}
                    </div>
                  </div>

                  {dietary.length === 0 && (
                    <div className="rounded-xl bg-[#B5D098]/20 border border-[#B5D098]/50 px-4 py-3 text-xs text-[#4a5e30] flex items-center gap-2">
                      <span>💡</span>
                      <span>No restrictions? No problem — you can skip this step.</span>
                    </div>
                  )}

                  {dietary.length > 0 && (
                    <div className="rounded-xl bg-[#587A34]/10 px-4 py-3 text-xs text-[#3a5220]">
                      <span className="font-semibold">Selected: </span>{dietary.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Allergies */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-bold text-base mb-1">Allergies & Sensitivities</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed mb-4">
                      We'll make sure to flag or exclude recipes containing these allergens.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGY_OPTIONS.map((opt) => (
                        <TagButton
                          key={opt}
                          label={opt}
                          selected={allergies.includes(opt)}
                          onClick={() => toggleItem(allergies, setAllergies, opt)}
                          variant="red"
                        />
                      ))}
                    </div>
                  </div>

                  {allergies.length === 0 && (
                    <div className="rounded-xl bg-[#B5D098]/20 border border-[#B5D098]/50 px-4 py-3 text-xs text-[#4a5e30] flex items-center gap-2">
                      <span>✅</span>
                      <span>No allergies? Great — you can skip this step or add one later.</span>
                    </div>
                  )}

                  {allergies.length > 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
                      <span className="font-semibold">Allergic to: </span>{allergies.join(", ")}
                    </div>
                  )}

                  {/* Summary before finish */}
                  <div className="mt-2 rounded-2xl bg-[#32491B]/8 border border-[#B5D098]/40 px-4 py-4 space-y-2">
                    <p className="text-[#32491B] text-xs font-bold uppercase tracking-wider mb-2">Profile Summary</p>
                    <div className="flex items-center gap-3">
                      <Avatar name={name || "?"} avatar={avatar} size="sm" />
                      <div>
                        <p className="text-[#2d3f1a] font-semibold text-sm">{name || "—"}</p>
                        <p className="text-[#4a5e30] text-xs">{dateOfBirth || "No birthday set"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}
          </div>

          {/* Footer / Navigation */}
          <div className="px-7 pb-6 pt-2 shrink-0 border-t border-[#B5D098]/30">
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-40"
                >
                  Back
                </button>
              )}

              {step < TOTAL_STEPS - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all duration-200 shadow-md cursor-pointer"
                >
                  {step === 0 ? "Let's Go 🍳" : "Next"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Finish & Start Cooking 🎉"
                  )}
                </button>
              )}
            </div>

            {/* Skip option on dietary/allergy steps */}
            {(step === 2 || step === 3) && (
              <button
                type="button"
                onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
                disabled={isSaving}
                className="w-full mt-2 text-center text-xs text-[#4a5e30]/60 hover:text-[#4a5e30] transition-colors py-1 cursor-pointer"
              >
                Skip this step
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FirstTimeProfileModal;