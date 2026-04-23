import { Link } from "react-router-dom";
import heroBg from "../../assets/hero-bg.jpg";
import pic1 from "../../assets/placeholder1.png";
import pic2 from "../../assets/placeholder2.png";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div id="home" className="relative w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img 
          src={heroBg} 
          alt="hero section background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B211A]/90 via-[#2d3f1a]/80 to-[#8BAE66]/70" />
      </div>

      <div className="relative flex flex-col items-center py-12 lg:py-16 px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-center tracking-tight font-bold text-white px-4">
          CTRL + ALT + 
          <span className="relative inline-block ml-2 gentle-scale">
            <span className="absolute inset-0 blur-xl bg-[#BBCB2E]/30 rounded-full"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#BBCB2E] to-[#D4E67B]">
              DELISH
            </span>
          </span>
        </h1>
        
        <h2 className="mt-3 text-lg sm:text-xl lg:text-2xl text-center text-white/90 font-medium px-4">
          Discover recipes made just for you.
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center items-center">
          <div className="group relative">
            <img 
              src={pic1} 
              alt="Delicious pasta dish"
              className="relative w-48 sm:w-56 lg:w-64 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-all duration-300 cursor-pointer"
            />
          </div>
          
          <div className="group relative">
            <img 
              src={pic2} 
              alt="Delicious dessert"
              className="relative w-48 sm:w-56 lg:w-64 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-all duration-300 cursor-pointer"
            />
          </div>
        </div>

        <div className="text-white/90 mt-8 flex justify-center px-6">
          <p className="text-center text-sm sm:text-base max-w-lg">
            Create an account to save your favorite recipes and get 
            <span className="font-semibold text-[#BBCB2E]"> personalized suggestions </span>
            based on what you love to cook.
          </p>
        </div>

        <Link
          to="/?auth=signup"
          className="group mt-6 inline-flex items-center gap-3 px-8 py-3 text-center rounded-full bg-gradient-to-r from-[#839705] to-[#2B3102] text-white font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          <span>Get Started Here</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      <style>{`
        @keyframes gentleScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .gentle-scale {
          animation: gentleScale 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;