import { X } from "lucide-react";

const Signup = ({ isOpen, onClose, onSwitch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-[#5A7A38] rounded-[2rem] shadow-2xl mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-center text-4xl font-lemon text-[#1B211A] mb-8">Sign Up</h2>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Email" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          <input type="text" placeholder="Username" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          <input type="text" placeholder="First Name" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          <input type="text" placeholder="Last Name" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          <input type="password" placeholder="Password" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          <input type="password" placeholder="Confirm Password" className="w-full p-3 rounded-full bg-[#EFE3C8] placeholder-gray-500 outline-none" />
          
          <p className="text-center text-sm mt-2">
            Already have an account?{" "}
            <button 
                type="button" 
                onClick={onSwitch}
                className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
            >
                Log In
            </button>
          </p>

          <button className="mt-4 w-1/4 self-center py-2 bg-[#2D3A18] text-white font-bold rounded-lg hover:bg-[#1B211A] transition">
            SIGN UP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;