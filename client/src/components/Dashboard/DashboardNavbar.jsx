const DashboardNavbar = ({ setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  return (
    <nav className="bg-[#32491B] px-4 md:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-3xl focus:outline-none lg:hidden"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <i className="fas fa-utensils text-[#F0E6D1] text-2xl"></i>
          <span className="font-lemon text-white text-xl">DISHCOVERY</span>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <span className="font-lemon text-white text-4xl tracking-wide">DISHCOVERY</span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button className="text-white hover:text-[#B5D098] transition-colors">
          <i className="fas fa-newspaper text-2xl md:text-3xl"></i>
        </button>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="text-white hover:text-[#B5D098] transition-colors"
        >
          <i className="fas fa-home text-2xl md:text-3xl"></i>
        </button>
        <div className="w-10 h-10 rounded-full bg-[#F0E6D1] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <span className="text-[#32491B] font-bold text-lg">T</span>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;