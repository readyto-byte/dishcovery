import heroBg from "../../assets/hero-bg.jpg";
import pic1 from "../../assets/placeholder1.jpg";
import pic2 from "../../assets/placeholder2.jpg";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div id="home" className="relative w-full">

      <div className="absolute inset-0 -z-10">
        <img 
          src={heroBg} 
          alt="hero section background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B211A] from-47% to-[#8BAE66] opacity-80" />
      </div>

      <div className="relative flex flex-col items-center py-10 lg:py-20">
        <h1 className="text-3xl sm:text-4xl lg:text-6xl text-center tracking-wide font-roboto text-white font-bold px-4">
          CTRL + ALT + <span className="text-[#BBCB2E]">DELISH</span>
        </h1>
        
        <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl text-center text-white font-fredoka font-semibold px-4">
          Discover recipes made just for you.
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center items-center">
          <img src={pic1} alt="Sample 1" className="w-55 sm:w-60 lg:w-70 rounded-2xl object-cover shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer" />
          <img src={pic2} alt="Sample 2" className="w-55 sm:w-60 lg:w-70 rounded-2xl object-cover shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer" />
        </div>

        <div className="text-white mt-10 flex justify-center px-6">
          <p className="text-center font-freeman max-w-md sm:max-w-lg md:max-w-xl lg:max-w-none text-sm sm:text-base md:text-lg">
            Create an account to save your favorite recipes and get suggestions based on what you love to cook.
          </p>
        </div>

        <a href="#" className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-center rounded-md bg-gradient-to-l from-[#839705] to-[#2B3102] text-white hover:scale-105 transition font-freeman">
          Get Started Here
          <ArrowRight size={18}/>
        </a>
      </div>
    </div>
  );
};

export default HeroSection