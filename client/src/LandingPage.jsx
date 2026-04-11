import AboutSection from "./components/AboutSection"
import FooterSection from "./components/FooterSection"
import HeroSection from "./components/HeroSection"
import HowItWorks from "./components/HowItWorks"
import Navbar from "./components/Navbar"
import SampleRecipe from "./components/SampleRecipe"

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

