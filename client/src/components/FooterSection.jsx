const FooterSection = () => {
  return (
    <footer className="w-full bg-[#1B211A] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-bold text-white text-xl tracking-wide font-lemon">
            DISH<span className="text-[#BBCB2E]">COVERY</span>
          </span>
          <p className="text-white text-sm font-fredoka">
            Discover recipes made just for you.
          </p>
        </div>

        <nav className="flex items-center justify-end gap-10">
          <a
            href="#"
            className="text-white text-base sm:text-lg font-freeman hover:text-[#BBCB2E] transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="#"
            className="text-white text-base sm:text-lg font-freeman hover:text-[#BBCB2E] transition-colors duration-200"
          >
            How It Works
          </a>
          <a
            href="#"
            className="text-white text-base sm:text-lg font-freeman hover:text-[#BBCB2E] transition-colors duration-200"
          >
            About
          </a>
        </nav>
      </div>

      <div className="mt-8 border-t border-white/10 pt-4 text-center">
        <p className="text-white/50 text-xs font-freeman">
          Made by Computer Engineering Students © 2026
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;