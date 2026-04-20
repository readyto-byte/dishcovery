import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AboutSection from "./components/LandingPage_comp/AboutSection"
import FooterSection from "./components/LandingPage_comp/FooterSection"
import HeroSection from "./components/LandingPage_comp/HeroSection"
import HowItWorks from "./components/LandingPage_comp/HowItWorks"
import Navbar from "./components/LandingPage_comp/Navbar"
import SampleRecipe from "./components/LandingPage_comp/SampleRecipe"
import Signup from "./components/LandingPage_comp/Signup"
import Login from "./components/LandingPage_comp/Login"

const LandingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [signupSuccessMessage, setSignupSuccessMessage] = useState(null);

  const isLoginOpen = searchParams.get("auth") === "login";
  const isSignupOpen = searchParams.get("auth") === "signup";

  const openLogin = () => setSearchParams({ auth: "login" });
  const openSignup = () => setSearchParams({ auth: "signup" });
  const closeAuth = () => setSearchParams({});

  const handleSignupSuccess = (message) => {
    setSearchParams({});
    setSignupSuccessMessage(message);
  };

  return (
    <div className="relative">
      <Navbar onSignupClick={openSignup} onLoginClick={openLogin}/>
      
      <HeroSection />
      <HowItWorks />
      <SampleRecipe />
      <AboutSection />
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
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-14 w-14 text-[#839705] mb-4" aria-hidden />
              <h2 id="signup-success-title" className="text-xl font-semibold text-[#2D3A18] tracking-tight">
                Sign up successful
              </h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{signupSuccessMessage}</p>
              <button
                type="button"
                onClick={() => setSignupSuccessMessage(null)}
                className="mt-8 w-full py-2.5 rounded-lg bg-[#2D3A18] text-white text-sm font-medium hover:bg-[#2D3A18]/90 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LandingPage;