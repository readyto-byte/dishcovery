import { useState, useEffect, useRef } from "react";
import { apiCall } from "../../api/config";

const DashboardNavbar = ({ setCurrentPage, sidebarOpen, setSidebarOpen, activeProfile, onActiveProfileChange }) => {
  const [profiles, setProfiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(null);
  const dropdownRef = useRef(null);

  const fetchProfiles = async () => {
    try {
      const response = await apiCall("/api/profiles");
      const rows = Array.isArray(response?.data) ? response.data : [];
      setProfiles(rows);
      if (!activeProfile) {
        const active = rows.find((p) => p.is_active) || null;
        if (active) {
          onActiveProfileChange?.({ id: active.id, name: active.name ?? "", avatar: active.avatar_url ?? null });
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (dropdownOpen) fetchProfiles();
  }, [dropdownOpen]);



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchProfile = async (profile) => {
    if (profile.id === activeProfile?.id) { setDropdownOpen(false); return; }
    setSwitching(profile.id);
    try {
      await apiCall(`/api/profiles/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify({ isDefault: true }),
      });
      setProfiles((prev) => prev.map((p) => ({ ...p, is_active: p.id === profile.id })));
      onActiveProfileChange?.({ id: profile.id, name: profile.name ?? "", avatar: profile.avatar_url ?? null });
    } catch {}
    finally {
      setSwitching(null);
      setDropdownOpen(false);
    }
  };

  const initials = activeProfile?.name
    ? activeProfile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const getInitials = (name) =>
    (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <nav
      className="px-4 md:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30 w-full"
      style={{
        background: "rgba(50, 73, 27, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(181, 208, 152, 0.2)",
        marginLeft: sidebarOpen ? "-18rem" : "0",
        width: sidebarOpen ? "calc(100% + 18rem)" : "100%",
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
          onClick={() => setCurrentPage("favorites")}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-heart text-2xl md:text-3xl"></i>
        </button>

        <button
          onClick={() => setCurrentPage("dashboard")}
          className="text-white hover:text-[#B5D098] transition-colors cursor-pointer"
        >
          <i className="fas fa-home text-2xl md:text-3xl"></i>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            title={activeProfile?.name || "Profile"}
            className="hover:scale-105 transition-transform cursor-pointer focus:outline-none relative"
          >
            {activeProfile?.avatar ? (
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#B5D098] shadow"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#F0E6D1] flex items-center justify-center border-2 border-[#B5D098] shadow">
                <span className="text-[#32491B] font-bold text-base">{initials}</span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#32491B] border border-[#B5D098] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-[#B5D098]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl overflow-hidden z-50"
              style={{ background: "linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)" }}
            >
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #32491B, #839705, #B5D098)" }} />

              <div className="px-4 py-3 border-b border-[#B5D098]/30">
                <p className="text-[#32491B] text-xs font-bold uppercase tracking-widest">Switch Profile</p>
                <p className="text-[#587A34] text-[10px] mt-0.5">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
              </div>

              <div
                className="py-2 overflow-y-auto"
                style={{
                  maxHeight: '240px',
                  overflowY: 'auto',

                  scrollbarWidth: 'thin',
                  scrollbarColor: '#B5D098 transparent',
                }}
              >
                <style>{`
                  .profile-scroll::-webkit-scrollbar { width: 4px; }
                  .profile-scroll::-webkit-scrollbar-track { background: transparent; }
                  .profile-scroll::-webkit-scrollbar-thumb { background: #B5D098; border-radius: 4px; }
                `}</style>

                {profiles.length === 0 && (
                  <p className="text-center text-[#4a5e30] text-xs py-4">No profiles found.</p>
                )}

                <div className="profile-scroll" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {profiles.map((profile) => {
                    const isActive = profile.id === activeProfile?.id;
                    const isLoadingProfile = switching === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => handleSwitchProfile(profile)}
                        disabled={!!switching}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all cursor-pointer disabled:opacity-60 ${
                          isActive ? "bg-[#32491B]/10" : "hover:bg-[#B5D098]/30"
                        }`}
                      >
                        <div className="relative shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.name}
                              className={`w-9 h-9 rounded-full object-cover border-2 transition-all ${
                                isActive ? "border-[#32491B]" : "border-[#B5D098]/50"
                              }`}
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isActive
                                ? "bg-[#32491B] text-[#F0E6D1] border-[#32491B]"
                                : "bg-[#3a5220] text-[#F0E6D1] border-[#B5D098]/50"
                            }`}>
                              {getInitials(profile.name)}
                            </div>
                          )}
                          {isActive && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#587A34] border-2 border-[#f7f0e3] flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-semibold truncate ${isActive ? "text-[#32491B]" : "text-[#2d3f1a]"}`}>
                            {profile.name}
                          </p>
                          {isActive && (
                            <p className="text-[10px] text-[#587A34] font-semibold uppercase tracking-wider">Active</p>
                          )}
                        </div>

                        {isLoadingProfile ? (
                          <svg className="animate-spin w-4 h-4 text-[#587A34] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : !isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#587A34]/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#B5D098]/30">
                <button
                  onClick={() => { setCurrentPage("profile"); setDropdownOpen(false); }}
                  className="w-full py-2 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] text-xs font-semibold transition-all cursor-pointer"
                >
                  Manage Profiles
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;