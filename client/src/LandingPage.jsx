import AboutSection from "./components/AboutSection"
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
    </>
  )
}

export default LandingPage

