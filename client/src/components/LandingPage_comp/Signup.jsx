import { useState } from "react";
import { Eye, EyeOff, X, Mail, CheckCircle2, Check } from "lucide-react";
import API_BASE_URL from "../../api/config.js";

const NAME_ALLOWED_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

const normalizeNameInput = (value) => {
  const trimmed = String(value || "");
  return trimmed.replace(/[^A-Za-z '-]/g, "");
};

const Signup = ({ isOpen, onClose, onSwitch, onSignupSuccess }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const pwChecks = {
    length:    password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /\d/.test(password),
    special:   /[!@#$%^&*()_=+[\]{}|;':",.<>?/`~\\-]/.test(password),
  };
  const passwordValid = Object.values(pwChecks).every(Boolean);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;

  const resetFormState = () => {
    setEmail("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordTouched(false);
    setConfirmTouched(false);
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    resetFormState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const resolvedFirst = firstName.trim();
    const resolvedLast = lastName.trim();

    if (!email || !username || !resolvedFirst || !resolvedLast || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setError("Username must be 3–20 characters and contain only letters, numbers, or underscores.");
      return;
    }

    if (!NAME_ALLOWED_REGEX.test(resolvedFirst) || !NAME_ALLOWED_REGEX.test(resolvedLast)) {
      setError("First and last name must contain letters only (spaces, hyphens, and apostrophes are allowed).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordValid) {
      setError("Password does not meet all requirements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, firstName: resolvedFirst, lastName: resolvedLast, password }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("Server returned an invalid response. Check if backend is running on localhost:3000.");
        }
      }

      if (!response.ok) {
        if (response.status === 502) {
          throw new Error("Cannot reach backend server. Make sure `npm run dev` is running in the project root.");
        }
        throw new Error(data.error || `Signup failed (HTTP ${response.status}).`);
      }

      setUserEmail(email);
      setShowSuccessModal(true);
      resetFormState();
      if (typeof onSignupSuccess === "function") {
        onSignupSuccess();
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        setError("Network error: cannot reach API. Start backend (`npm run dev` in project root) and restart frontend dev server.");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !showSuccessModal) return null;

  const baseField =
    "w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all";
  const fieldOk  = `${baseField} border-gray-200 focus:ring-gray-900/10 focus:border-gray-300`;
  const fieldErr = `${baseField} border-red-300 focus:ring-red-200 focus:border-red-400`;

  const pwCheckItems = [
    { key: "length",    label: "At least 6 characters" },
    { key: "uppercase", label: "One uppercase letter (A–Z)" },
    { key: "lowercase", label: "One lowercase letter (a–z)" },
    { key: "number",    label: "One number (0–9)" },
    { key: "special",   label: "One special character (!@#$…)" },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-200 px-4 py-6">
          <div className="relative w-full max-w-md px-6 py-6 sm:p-8 bg-white rounded-2xl shadow-xl duration-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="font-lemon font-bold text-xl">
                <span className="text-[#1B211A]">Dish</span>
                <span className="text-[#839705]">covery</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl font-semibold text-[#2D3A18] tracking-tight">Create an account</h2>
              <p className="text-sm text-[#2D3A18] mt-2">Join us to get started</p>
            </div>

            <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(normalizeNameInput(e.target.value))}
                  className={fieldOk}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(normalizeNameInput(e.target.value))}
                  className={fieldOk}
                  autoComplete="family-name"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldOk}
                  autoComplete="username"
                />
                <p className="mt-1 text-xs text-gray-400 pl-1">Letters, numbers, and underscores only (3–20 chars)</p>
              </div>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldOk}
                autoComplete="email"
              />

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                    className={`${passwordTouched && !passwordValid ? fieldErr : fieldOk} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordTouched && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 pl-1">
                    {pwCheckItems.map(({ key, label }) => (
                      <li key={key} className={`flex items-center gap-1.5 text-xs ${pwChecks[key] ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center ${pwChecks[key] ? "bg-green-100" : "bg-gray-100"}`}>
                          {pwChecks[key] ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 rounded-full bg-gray-400 block" />}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
                    className={`${confirmTouched && confirmPassword && !passwordsMatch ? fieldErr : fieldOk} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmTouched && confirmPassword && (
                  <p className={`mt-1 text-xs pl-1 flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch
                      ? <><Check size={11} strokeWidth={3} /> Passwords match</>
                      : <><span className="font-bold">✕</span> Passwords do not match</>}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-2.5 bg-[#2D3A18] text-white text-sm font-medium rounded-lg hover:bg-[#2D3A18]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </button>

              <p className="text-center text-xs text-[#2D3A18] mt-1 mb-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="text-[#2D3A18] font-medium hover:underline bg-transparent border-none cursor-pointer"
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200 px-4 py-6">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90dvh] overflow-y-auto">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#839705] via-[#BBCB2E] to-[#839705]" />

            <div className="px-6 py-6 sm:p-8 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#839705]/20 to-[#BBCB2E]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-[#839705]" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#1B211A] mb-3">Check Your Email</h2>

              <div className="bg-[#F0F5E8] rounded-xl p-4 mb-5">
                <p className="text-[#1B211A] text-sm leading-relaxed">We've sent a verification link to</p>
                <p className="text-[#839705] font-semibold text-sm mt-1 break-all">{userEmail}</p>
              </div>

              <div className="space-y-3 text-left mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#839705] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">Click the link in the email to verify your account.</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#839705] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-gray-600">If you don't see the email, check your spam folder.</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#839705] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-sm text-gray-600">Once verified, you can log in and start discovering recipes.</p>
                </div>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-2.5 rounded-xl bg-[#2D3A18] text-white font-semibold text-sm hover:bg-[#1B211A] transition-all duration-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Signup;