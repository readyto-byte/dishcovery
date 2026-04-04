import {Menu, X} from "lucide-react";
import {useState} from "react";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
<nav className="sticky top-0 z-50 py-3 backdrop-blur-2xl bg-[#F0E6D1]/60 border-b border-[#DBCFB0]">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center flex-shrink-0 font-lemon font-bold text-xl">
            <span className="text-[#1B211A]">Dish</span>
            <span className="text-[#839705]">covery</span>
          </div>

          <ul className="hidden lg:flex space-x-12 font-freeman text-[#1B211A]">
            <li><a href="#" className="hover:text-[#839705] transition">Home</a></li>
            <li><a href="#" className="hover:text-[#839705] transition">How it works</a></li>
            <li><a href="#" className="hover:text-[#839705] transition">About</a></li>
          </ul>

          <div className="hidden lg:flex justify-center space-x-8 items-center font-bold">
            <a href="#" className="py-2 px-3 text-[#1B211A] hover:scale-105 transition">Log In</a>
            <a href="#" className="py-2 px-3 rounded-md bg-[#1B211A] text-white hover:scale-105 transition">
              Sign Up
            </a>
          </div>
          
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="fixed top-0 left-0 z-50 bg-[#F0E6D1] w-full h-full flex flex-col lg:hidden">
            
            <div className="flex justify-between items-center px-4 py-3">     
              <div className="font-lemon font-bold text-xl">
                <span className="text-[#1B211A]">Dish</span>
                <span className="text-[#839705]">covery</span>
              </div>
              <button onClick={toggleNavbar}>
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col bg-[#F0E6D1] w-full">
              <ul className="font-freeman font-bold text-[#1B211A] flex flex-col gap-4 mt-6 mb-6 items-center">
                <li><a href="#" className="hover:text-[#839705] transition">Home</a></li>
                <li><a href="#" className="hover:text-[#839705] transition">How it works</a></li>
                <li><a href="#" className="hover:text-[#839705] transition">About</a></li>
              </ul>

              <div className="pb-6 flex justify-center gap-4 font-bold">
                <a href="#" className="py-3 text-center border-2 border-[#1B211A] rounded-md text-[#1B211A] hover:scale-105 transition" style={{minWidth: "120px"}}>
                  Log In
                </a>
                <a href="#" className="py-3 text-center border-2 border-[#1B211A] rounded-md bg-[#1B211A] text-white hover:scale-105 transition" style={{minWidth: "120px"}}>
                  Sign Up
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </nav>
  )
}

export default Navbar
