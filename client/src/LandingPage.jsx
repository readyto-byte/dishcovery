import { useSearchParams } from "react-router-dom";
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

  const isLoginOpen = searchParams.get("auth") === "login";
  const isSignupOpen = searchParams.get("auth") === "signup";

  const openLogin = () => setSearchParams({ auth: "login" });
  const openSignup = () => setSearchParams({ auth: "signup" });
  const closeAuth = () => setSearchParams({}); 

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
      />
      <Login 
        isOpen={isLoginOpen} 
        onClose={closeAuth} 
        onSwitch={openSignup} 
      />
    </div>
  );
};

export default LandingPage;