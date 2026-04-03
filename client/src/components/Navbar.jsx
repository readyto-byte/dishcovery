const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg bg-[#F0E6D1]">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center flex-shrink-0 font-lemon font-bold text-xl">
            <span className="text-[#1B211A]">Dish</span>
            <span className="text-[#839705]">covery</span>
          </div>

          <ul className="hidden lg:flex space-x-12 font-freeman font-bold text-[#1B211A]">
            <li><a href="#" className="hover:text-[#839705] transition">Home</a></li>
            <li><a href="#" className="hover:text-[#839705] transition">How it works</a></li>
            <li><a href="#" className="hover:text-[#839705] transition">About</a></li>
          </ul>

          <div className="hidden lg:flex justify-center space-x-8 items-center font-bold">
            <a href="#" className="py-2 px-3 text-[#1B211A] ">Log In</a>
            <a href="#" className="py-2 px-3 rounded-md bg-[#1B211A] text-white hover:bg-opacity-90 transition">
              Sign Up
            </a>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
