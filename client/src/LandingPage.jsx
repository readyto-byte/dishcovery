import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import AboutSection from "./components/LandingPage_comp/AboutSection"
import FooterSection from "./components/LandingPage_comp/FooterSection"
import HeroSection from "./components/LandingPage_comp/HeroSection"
import HowItWorks from "./components/LandingPage_comp/HowItWorks"
import Navbar from "./components/LandingPage_comp/Navbar"
import SampleRecipe from "./components/LandingPage_comp/SampleRecipe"
import Signup from "./components/LandingPage_comp/Signup"
import Login from "./components/LandingPage_comp/Login"
import MeetTheTeam from "./components/LandingPage_comp/MeetTheTeam"

const LandingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [signupSuccessMessage, setSignupSuccessMessage] = useState(null);
  const [showScrollPopup, setShowScrollPopup] = useState(false);
  const [hasClosedPopup, setHasClosedPopup] = useState(false);

  const isLoginOpen = searchParams.get("auth") === "login";
  const isSignupOpen = searchParams.get("auth") === "signup";

  const openLogin = () => setSearchParams({ auth: "login" });
  const openSignup = () => setSearchParams({ auth: "signup" });
  const closeAuth = () => setSearchParams({});

  const handleSignupSuccess = (message) => {
    setSearchParams({});
    setSignupSuccessMessage(message);
  };

  const handleCloseSuccessAndOpenLogin = () => {
    setSignupSuccessMessage(null);
    openLogin();
  };

  const handleCloseSuccess = () => {
    setSignupSuccessMessage(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= pageHeight * 0.85 && !hasClosedPopup && !showScrollPopup) {
        const isAuthenticated = localStorage.getItem("token");
        if (!isAuthenticated && !isLoginOpen && !isSignupOpen) {
          setShowScrollPopup(true);
          // Auto hide after 8 seconds
          setTimeout(() => {
            setShowScrollPopup(false);
            setHasClosedPopup(true);
          }, 8000);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasClosedPopup, showScrollPopup, isLoginOpen, isSignupOpen]);

  const handleClosePopup = () => {
    setShowScrollPopup(false);
    setHasClosedPopup(true);
  };

  const handlePopupSignup = () => {
    setShowScrollPopup(false);
    setHasClosedPopup(true);
    openSignup();
  };

  return (
    <div className="relative">
      <Navbar onSignupClick={openSignup} onLoginClick={openLogin}/>
      
      <HeroSection />
      <HowItWorks />
      <SampleRecipe />
      <AboutSection />
      <MeetTheTeam />
      <FooterSection />

      <Signup
        isOpen={isSignupOpen}
        onClose={closeAuth}
        onSwitch={openLogin}
        onSignupSuccess={handleSignupSuccess}
      />
      <Login 
        isOpen={isLoginOpen} 
        onClose={closeAuth} 
        onSwitch={openSignup} 
      />

      {signupSuccessMessage ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-success-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl animate-fadeIn mx-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 text-[#839705] mb-4" aria-hidden />
              <h2 id="signup-success-title" className="text-lg sm:text-xl font-semibold text-[#2D3A18] tracking-tight">
                Sign up successful
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">{signupSuccessMessage}</p>
              
              <div className="flex flex-col gap-2 w-full mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={handleCloseSuccessAndOpenLogin}
                  className="w-full py-2 rounded-lg bg-[#2D3A18] text-white text-sm font-medium hover:bg-[#2D3A18]/90 transition-all active:scale-[0.98]"
                >
                  Continue to Log in
                </button>
                <button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="w-full py-2 rounded-lg bg-gray-100 text-[#2D3A18] text-sm font-medium hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showScrollPopup && (
        <>
          <div className={`fixed z-[160] animate-slideUp ${
            window.innerWidth < 640 
              ? 'bottom-0 left-0 right-0 px-4 pb-4' 
              : 'bottom-6 right-6'
          }`}>
            <div className={`relative bg-gradient-to-r from-[#1B211A] to-[#2D3A18] shadow-2xl overflow-hidden ${
              window.innerWidth < 640 
                ? 'rounded-2xl w-full' 
                : 'rounded-xl max-w-sm'
            }`}>
              
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>

              <div className={`p-4 ${window.innerWidth < 640 ? 'pr-10' : 'pr-8'}`}>
                <div>
                  <p className="text-white text-sm sm:text-base font-semibold mb-1">
                    Join Dishcovery
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3">
                    Create an account to save recipes and get personalized suggestions.
                  </p>
                  <button
                    onClick={handlePopupSignup}
                    className="text-[#BBCB2E] text-xs sm:text-sm font-semibold hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Sign up free
                    <span className="text-base">→</span>
                  </button>
                </div>
              </div>

              <div className="h-0.5 bg-gradient-to-r from-[#839705] to-[#BBCB2E] animate-shrink"></div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-shrink {
          animation: shrink 8s linear forwards;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;