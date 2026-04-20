import { useState } from 'react';
import Sidebar from "./components/Dashboard/Sidebar";
import DashboardNavbar from "./components/Dashboard/DashboardNavbar";
import WelcomeBanner from "./components/Dashboard/WelcomeBanner"; 

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="relative min-h-screen bg-[#B5D098]">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main style={{ marginLeft: sidebarOpen ? '18rem' : '0' }} className="transition-all duration-300">
        <DashboardNavbar 
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <WelcomeBanner /> 
        
      </main>
    </div>
  );
};

export default DashboardPage;