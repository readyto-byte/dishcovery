import { useEffect } from 'react';

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
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'history', icon: 'fa-history', label: 'History' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' }
  ];

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 w-72 h-full bg-[#F0E6D1] rounded-r-[30px] z-30 shadow-2xl transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="relative h-full flex flex-col">
          <div className="flex items-center gap-3 px-6 pt-12 pb-8 border-b border-[#B5D098]/30">
            <div className="w-14 h-14 bg-[#587A34] rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-utensils text-white text-2xl"></i>
            </div>
            <span className="font-lemon text-2xl text-[#32491B]">DISHCOVERY</span>
          </div>
          
          <div className="flex-1 py-8 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-4 px-8 py-4 w-full text-left rounded-r-full transition-all duration-200 ${
                  currentPage === item.id 
                    ? 'bg-[#B5D098]' 
                    : 'hover:bg-[#B5D098]/30'
                }`}
              >
                <i className={`fas ${item.icon} w-6 h-6 text-[#32491B] text-xl`}></i>
                <span className="text-[#000000] font-semibold text-2xl">{item.label}</span>
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