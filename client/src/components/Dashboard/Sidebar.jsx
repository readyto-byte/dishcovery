import { useEffect } from 'react';
import dcLogo from "../../assets/DC.png";

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, onLogout }) => {

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const navItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Dashboard' }, 
    { id: 'meal-plan', icon: 'fa-calendar-alt', label: 'Meal Plan' },
    { id: 'history', icon: 'fa-history', label: 'History' },
    { id: 'favorites', icon: 'fa-heart', label: 'Favorites' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ width: '272px', minHeight: '100vh', background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
      >
        <div className="relative h-full flex flex-col overflow-hidden">

          {/* 🔥 LOGO SECTION FIXED HERE */}
          <div className="flex items-center justify-center px-6 pt-10 pb-7">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { 
                setCurrentPage('dashboard'); 
                if (window.innerWidth < 1024) setSidebarOpen(false); 
              }}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#32491B] flex items-center justify-center shadow-md">
                <img 
                  src={dcLogo}
                  alt="Dishcovery Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="font-lemon font-bold text-2xl">
                <span className="text-[#1B211A]">Dish</span>
                <span className="text-[#839705]">covery</span>
              </div>
            </div>
          </div>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />

          <div className="flex-1 py-2 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`relative flex items-center gap-4 pl-6 pr-0 py-3.5 w-full text-left transition-all duration-200 group cursor-pointer ${
                  currentPage === item.id ? '' : 'hover:bg-[#B5D098]/40'
                }`}
              >
                {currentPage === item.id && (
                  <span className="absolute inset-y-0 left-0 right-0 bg-[#B5D098] z-0" />
                )}

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 relative z-10 ${
                  currentPage === item.id ? 'bg-[#32491B]' : 'bg-[#B5D098]/50 group-hover:bg-[#B5D098]'
                }`}>
                  <i className={`fas ${item.icon} text-base ${
                    currentPage === item.id ? 'text-[#F0E6D1]' : 'text-[#32491B]'
                  }`}></i>
                </div>

                <span className="font-semibold text-base tracking-wide text-[#2d3f1a] relative z-10">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="px-3 pb-8 pt-4">
            <button
              onClick={onLogout}
              className="group flex items-center gap-4 w-full px-5 py-3.5 rounded-xl border border-[#32491B]/20 bg-[#32491B]/5 hover:bg-[#32491B] transition-all duration-300 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#32491B]/10 group-hover:bg-[#587A34] flex items-center justify-center shrink-0 transition-all duration-300">
                <i className="fas fa-sign-out-alt text-[#32491B] group-hover:text-white text-base transition-colors duration-300"></i>
              </div>
              <span className="text-[#32491B] group-hover:text-white font-semibold text-base tracking-wide transition-colors duration-300">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;