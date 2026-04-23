import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = ({ onSignupClick, onLoginClick }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleAction = (action) => {
    action(); 
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  const scrollToHome = () => {
    const homeSection = document.getElementById("home");
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: "smooth" });
    }
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-2xl bg-[#F0E6D1]/60 border-b border-[#DBCFB0]">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">

          <div 
            onClick={scrollToHome}
            className="flex items-center flex-shrink-0 font-lemon font-bold text-xl cursor-pointer group"
          >
            <span className="text-[#1B211A] group-hover:text-[#839705] transition-colors duration-300">Dish</span>
            <span className="text-[#839705] group-hover:text-[#1B211A] transition-colors duration-300">covery</span>
          </div>

          <ul className="hidden lg:flex space-x-12 font-freeman text-[#1B211A]">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="hover:text-[#839705] transition">Home</a></li>
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection("how-it-works"); }} className="hover:text-[#839705] transition">How it works</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className="hover:text-[#839705] transition">About</a></li>
          </ul>

          <div className="hidden lg:flex justify-center space-x-8 items-center font-bold">
            <button 
              onClick={onLoginClick} 
              className="py-2 px-3 text-[#1B211A] hover:scale-105 transition active:opacity-70"
            >
              Log In
            </button>
            <button 
              onClick={onSignupClick} 
              className="py-2 px-3 rounded-md bg-[#1B211A] text-white hover:scale-105 transition active:opacity-70"
            >
              Sign Up
            </button>
          </div>
          

          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="fixed top-0 left-0 z-50 bg-[#F0E6D1] w-full h-full flex flex-col lg:hidden animate-slideIn">
            
            <div className="flex justify-between items-center px-4 py-3">     
              <div 
                onClick={scrollToHome}
                className="font-lemon font-bold text-xl cursor-pointer group"
              >
                <span className="text-[#1B211A] group-hover:text-[#839705] transition">Dish</span>
                <span className="text-[#839705] group-hover:text-[#1B211A] transition">covery</span>
              </div>
              <button onClick={toggleNavbar} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col bg-[#F0E6D1] w-full flex-1">
              <ul className="font-freeman font-bold text-[#1B211A] flex flex-col gap-6 mt-8 mb-8 items-center">
                <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="text-lg hover:text-[#839705] transition">Home</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection("how-it-works"); }} className="text-lg hover:text-[#839705] transition">How it works</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className="text-lg hover:text-[#839705] transition">About</a></li>
              </ul>

              <div className="pb-8 flex justify-center gap-4 font-bold">
                <button 
                  onClick={() => handleAction(onLoginClick)}
                  className="py-3 text-center border-2 border-[#1B211A] rounded-md text-[#1B211A] hover:scale-105 transition" 
                  style={{minWidth: "120px"}}
                >
                  Log In
                </button>
                <button 
                  onClick={() => handleAction(onSignupClick)} 
                  className="py-3 text-center border-2 border-[#1B211A] rounded-md bg-[#1B211A] text-white hover:scale-105 transition" 
                  style={{minWidth: "120px"}}
                >
                  Sign Up
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;