const DashboardNavbar = ({ setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  return (
    <nav
      className="px-4 md:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10 w-full"
      style={{
        background: 'rgba(50, 73, 27, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(181, 208, 152, 0.2)',
        /* This line pulls the navbar left to touch the sidebar */
        marginLeft: sidebarOpen ? '-18rem' : '0', 
        /* This ensures the navbar still covers the full width after being pulled */
        width: sidebarOpen ? 'calc(100% + 18rem)' : '100%',
      }}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-3xl focus:outline-none lg:hidden cursor-pointer"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      {/* Action Icons and Profile section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Favorite Icon */}
        <button 
          onClick={() => setCurrentPage('favorites')} // You can change this state name as needed
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-heart text-2xl md:text-3xl"></i>
        </button>

        {/* Home Icon */}
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-home text-2xl md:text-3xl"></i>
        </button>

        {/* User Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#F0E6D1] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <span className="text-[#32491B] font-bold text-lg">T</span>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;