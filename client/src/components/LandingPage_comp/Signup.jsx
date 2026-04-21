import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import API_BASE_URL from "../../api/config.js";

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
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !username || !firstName || !lastName || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, firstName, lastName, password }),
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

      const message =
        data.message || "You’re signed up! Check your email to verify your account before logging in.";
      resetFormState();
      onSignupSuccess?.(message);
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

  if (!isOpen) return null;

  const fieldClassName =
    "w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-200">
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl mx-4 duration-200">
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

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#2D3A18] tracking-tight">Create an account</h2>
          <p className="text-sm text-[#2D3A18] mt-2">Join us to get started</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={fieldClassName}
              autoComplete="given-name"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={fieldClassName}
              autoComplete="family-name"
            />
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={fieldClassName}
            autoComplete="username"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClassName}
            autoComplete="email"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${fieldClassName} pr-10`}
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
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${fieldClassName} pr-10`}
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

          {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full py-2.5 bg-[#2D3A18] text-white text-sm font-medium rounded-lg hover:bg-[#2D3A18]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "…" : "Sign up"}
          </button>

          <p className="text-center text-xs text-[#2D3A18] mt-2">
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
  );
};

export default Signup;