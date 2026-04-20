import { StrictMode } from 'react' 
import { createRoot } from 'react-dom/client'
<<<<<<< Updated upstream
import { BrowserRouter, Routes, Route } from 'react-router-dom' 
=======
import { BrowserRouter } from 'react-router-dom'
>>>>>>> Stashed changes
import './index.css'
import LandingPage from './LandingPage.jsx'
import DashboardPage from './DashboardPage.jsx'  

createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< Updated upstream
    <BrowserRouter> 
      <Routes>       
        <Route path="/" element={<LandingPage />} />           
        <Route path="/dashboard" element={<DashboardPage />} /> 
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
=======
   <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  </StrictMode>
)
>>>>>>> Stashed changes
