import { X } from "lucide-react";

const Signup = ({ isOpen, onClose, onSwitch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-200">
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl mx-4 animate-in fade-in zoom-in duration-200">
        {/* Logo and Close Button Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="font-lemon font-bold text-xl">
            <span className="text-[#1B211A]">Dish</span>
            <span className="text-[#839705]">covery</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#2D3A18] tracking-tight">Create an account</h2>
          <p className="text-sm text-[#2D3A18] mt-2">Join us to get started</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
          </div>
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
          />

          <button
            type="submit"
            className="mt-2 w-full py-2.5 bg-[#2D3A18] text-white text-sm font-medium rounded-lg hover:bg-[#2D3A18]/90 transition-all active:scale-[0.98]"
          >
            Sign up
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