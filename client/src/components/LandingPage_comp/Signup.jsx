import { useState } from "react";
import { X } from "lucide-react";

const Signup = ({ isOpen, onClose, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFormState = () => {
    setEmail("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
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
      const response = await fetch("/api/auth/signup", {
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

      setSuccess(data.message || "Signup successful. Check your email for verification.");
      setPassword("");
      setConfirmPassword("");
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
          <h2 className="text-2xl font-semibold text-[#2D3A18] tracking-tight">Create an account</h2>
          <p className="text-sm text-[#2D3A18] mt-2">Join us to get started</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none"
          />

          {error ? <p className="text-sm text-red-200 text-center">{error}</p> : null}
          {success ? <p className="text-sm text-green-200 text-center">{success}</p> : null}
          
          <p className="text-center text-sm mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="text-[#2D3A18] font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              Log in
            </button>
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-1/4 self-center py-2 bg-[#2D3A18] text-white font-bold rounded-lg hover:bg-[#1B211A] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : "SIGN UP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;