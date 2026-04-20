import AboutSection from "./components/LandingPage_comp/AboutSection"
import FooterSection from "./components/LandingPage_comp/FooterSection"
import HeroSection from "./components/LandingPage_comp/HeroSection"
import HowItWorks from "./components/LandingPage_comp/HowItWorks"
import Navbar from "./components/LandingPage_comp/Navbar"
import SampleRecipe from "./components/LandingPage_comp/SampleRecipe"

const LandingPage = () => {
  return (
    <>
     <Navbar />
     <HeroSection />
     <HowItWorks />
     <SampleRecipe />
     <AboutSection />
     <FooterSection />
    </>
  )
}

export default LandingPage

