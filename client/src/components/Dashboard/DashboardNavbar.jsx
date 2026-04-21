const DashboardNavbar = ({ setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  return (
    <nav
      className="px-4 md:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10 w-full"
      style={{
        background: 'rgba(50, 73, 27, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(181, 208, 152, 0.2)',
        marginLeft: sidebarOpen ? '-18rem' : '0', 
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
      
      {/* Home and Profile section */}
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
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