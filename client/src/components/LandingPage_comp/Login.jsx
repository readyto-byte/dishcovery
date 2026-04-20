import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const Login = ({ isOpen, onClose, onSwitch }) => {
  const navigate = useNavigate();
  const [loginInfo, setLoginInfo] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFormState = () => {
    setLoginInfo("");
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginInfo.trim() || !password) {
      setError("Email/Username and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = loginInfo.includes("@")
        ? { email: loginInfo.trim(), password }
        : { username: loginInfo.trim(), password };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        throw new Error(data.error || `Login failed (HTTP ${response.status}).`);
      }

      if (!data.success) {
        throw new Error(data.error || "Login was not successful.");
      }

      resetFormState();
      navigate("/dashboard", { replace: true });
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-[#5A7A38] rounded-[2rem] shadow-2xl mx-4">
        <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#2D3A18] tracking-tight">Welcome back!</h2>
          <p className="text-sm text-[#2D3A18] mt-2">Sign in to your account</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            value={loginInfo}
            onChange={(e) => setLoginInfo(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />

          {error ? <p className="text-sm text-red-200 text-center">{error}</p> : null}
          {success ? <p className="text-sm text-green-200 text-center">{success}</p> : null}

          <p className="text-center text-xs text-[#2D3A18] mt-2">
            No account yet?{" "}
            <button 
                type="button"
                onClick={onSwitch} 
                className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
            </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-1/4 self-center py-2 bg-[#2D3A18] text-white font-bold rounded-lg hover:bg-[#1B211A] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : "LOG IN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;