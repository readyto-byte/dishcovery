import { useState, useRef, useEffect } from "react";
import { apiCall } from "../../api/config";

const DIETARY_OPTIONS = ["Keto", "Gluten-Free", "Vegan", "Vegetarian", "Paleo", "Dairy-Free"];
const ALLERGY_OPTIONS = ["Nuts", "Shellfish", "Eggs", "Soy", "Wheat", "Fish"];

const compressImage = (base64String, maxWidth = 150, maxHeight = 150, quality = 0.5) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

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

const AvatarUpload = ({ name, avatar, onAvatarChange }) => {
  const fileInputRef = useRef(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 2MB.");
      return;
    }
    
    setIsCompressing(true);
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {

        const compressed = await compressImage(ev.target.result, 150, 150, 0.5);
        onAvatarChange(compressed);
      } catch (error) {
        console.error("Failed to compress image:", error);
        alert("Failed to process image. Please try a different image.");
      } finally {
        setIsCompressing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar name={name || "?"} avatar={avatar} size="lg" />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isCompressing ? (
            <svg className="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isCompressing}
        className="px-4 py-1.5 rounded-full bg-[#587A34]/20 text-[#3a5220] text-xs font-semibold hover:bg-[#587A34]/30 transition-colors border border-[#587A34]/30 disabled:opacity-50"
      >
        {isCompressing ? "Processing..." : (avatar ? "Change Photo" : "Upload Photo")}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

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
const FirsttimeModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [dietary, setDietary] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [isSaving, setIsSaving] = useState(false);

  const TOTAL_STEPS = 4;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleFinish = async () => {
    if (!name.trim()) { setStep(1); setError("Please enter your name."); return; }
    
    setIsSaving(true);
    setError("");
    
    try {
      const response = await apiCall("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          date_of_birth: dateOfBirth,
          avatar_url: avatar,
          dietary_restrictions: dietary,
          allergies: allergies,
          is_active: true,
          is_default: true,
          isDefault: true,
        }),
      });
      
      if (!response?.data) {
        throw new Error("Profile created but no data returned.");
      }

      localStorage.setItem('dishcovery_first_time_modal_seen', 'true');

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
      setIsSaving(false);
    }
  };

  const skipStep = () => {
    if (step === TOTAL_STEPS - 1) {
      handleFinish();
    } else {
      goNext();
    }
  };

  const slideClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <div className="fixed inset-0 z-[9999]">

      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-[10000] flex items-center justify-center min-h-screen p-4">
        <div
          className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)" }}
          onClick={(e) => e.stopPropagation()}
        >

          <div className="h-1.5 w-full shrink-0" style={{ background: "linear-gradient(90deg, #32491B, #839705, #B5D098)" }} />

          <div className="px-7 pt-6 pb-5 shrink-0" style={{ background: "linear-gradient(135deg, #32491B 0%, #587A34 100%)" }}>
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
            <p className="text-[#B5D098]/80 text-xs mt-2 leading-relaxed">
              Help us personalize your recipe recommendations by creating your profile.
            </p>
            <div className="mt-4">
              <StepDots total={TOTAL_STEPS} current={step} />
            </div>
          </div>

          <div className="px-7 py-6 flex-1 overflow-y-auto max-h-[60vh]">
            <div className={`transition-all duration-180 ${slideClass}`}>

              {step === 0 && (
                <div className="flex flex-col items-center text-center gap-5 py-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-extrabold text-xl mb-2">Welcome to Dishcovery</h3>
                    <p className="text-[#4a5e30] text-sm leading-relaxed">
                      It looks like this is your first time here. Let's take a moment to create your profile so we can suggest recipes tailored just for you.
                    </p>
                  </div>
                  <div className="w-full bg-[#B5D098]/30 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex items-center gap-3 text-sm text-[#32491B]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Your name and birthday</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#32491B]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Dietary restrictions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#32491B]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-medium">Allergies and sensitivities</span>
                    </div>
                  </div>
                </div>
              )}

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
                      max={new Date().toISOString().split("T")[0]}
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
                      Select any that apply. We will avoid ingredients that do not match your diet.
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No restrictions? No problem. You can skip this step.</span>
                    </div>
                  )}

                  {dietary.length > 0 && (
                    <div className="rounded-xl bg-[#587A34]/10 px-4 py-3 text-xs text-[#3a5220]">
                      <span className="font-semibold">Selected: </span>{dietary.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#2d3f1a] font-bold text-base mb-1">Allergies and Sensitivities</h3>
                    <p className="text-[#4a5e30] text-xs leading-relaxed mb-4">
                      We will make sure to flag or exclude recipes containing these allergens.
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No allergies? Great. You can skip this step or add one later.</span>
                    </div>
                  )}

                  {allergies.length > 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
                      <span className="font-semibold">Allergic to: </span>{allergies.join(", ")}
                    </div>
                  )}

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

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}
          </div>

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
                  {step === 0 ? "Let's Go" : "Next"}
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
                      Saving...
                    </>
                  ) : (
                    "Finish and Start Cooking"
                  )}
                </button>
              )}
            </div>

            {(step === 2 || step === 3) && (
              <button
                type="button"
                onClick={skipStep}
                disabled={isSaving}
                className="w-full mt-2 text-center text-xs text-[#4a5e30]/60 hover:text-[#4a5e30] transition-colors py-1 cursor-pointer"
              >
                Skip this step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirsttimeModal;