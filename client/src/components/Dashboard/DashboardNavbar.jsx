import { useState, useEffect } from "react";
import { apiCall } from "../../api/config";

const DashboardNavbar = ({ setCurrentPage, sidebarOpen, setSidebarOpen, activeProfile: activeProfileProp }) => {
  const [activeProfile, setActiveProfile] = useState(activeProfileProp);

  useEffect(() => {
    if (activeProfileProp) {
      setActiveProfile(activeProfileProp);
      return;
    }
    const fetchActiveProfile = async () => {
      try {
        const response = await apiCall("/api/profiles");
        const rows = Array.isArray(response?.data) ? response.data : [];
        const active = rows.find((p) => p.is_active) || rows[0] || null;
        if (active) {
          setActiveProfile({
            name: active.name ?? "",
            avatar: active.avatar_url ?? null,
          });
        }
      } catch {

      }
    };
    fetchActiveProfile();
  }, [activeProfileProp]);

  const initials = activeProfile?.name
    ? activeProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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

      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => setCurrentPage('favorites')}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-heart text-2xl md:text-3xl"></i>
        </button>

        <button
          onClick={() => setCurrentPage('dashboard')}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-home text-2xl md:text-3xl"></i>
        </button>

        <button
          onClick={() => setCurrentPage('profile')}
          title={activeProfile?.name || 'Profile'}
          className="hover:scale-105 transition-transform cursor-pointer focus:outline-none"
        >
          {activeProfile?.avatar ? (
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#B5D098] shadow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#F0E6D1] flex items-center justify-center border-2 border-[#B5D098] shadow">
              <span className="text-[#32491B] font-bold text-lg">{initials}</span>
            </div>
          )}
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;