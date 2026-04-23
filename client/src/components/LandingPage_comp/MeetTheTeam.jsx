import React, { useState, useEffect } from 'react';

import TyroneImg from '../../assets/Tyrone.jpg';
import RachelleImg from '../../assets/Rachelle.jpg';
import GinoImg from '../../assets/Gino.jpg';
import MauiImg from '../../assets/Maui.jpg';
import JosefImg from '../../assets/Josef.png';

const ChevronLeft = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const Github = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
const Linkedin = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Mail = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const Copy = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const Check = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const teamMembers = [
  {
    id: 1,
    name: "Tyrone Sangalang",
    role: "Lead Backend Developer",
    contribution: "Leads the backend development team, designs system architecture, and ensures robust API performance.",
    image: TyroneImg,
    social: { github: "https://github.com/readyto-byte", linkedin: "https://www.linkedin.com/in/tyrone-sangalang/", email: "sangalang.tyronel@gmail.com" }
  },
  {
    id: 2,
    name: "Rachelle Quinto",
    role: "Lead Frontend Developer & UI/UX",
    contribution: "Leads the frontend team, establishes UI/UX standards, and designs intuitive user interfaces.",
    image: RachelleImg,
    social: { github: "https://github.com/r-quinto", linkedin: "https://www.linkedin.com/in/rachelle-quinto-0017433a9", email: "rshlquinto@gmail.com" }
  },
  {
    id: 3,
    name: "Gino Ruiz",
    role: "Backend Developer",
    contribution: "Develops and maintains backend services, optimizes database queries, and implements API endpoints.",
    image: GinoImg,
    social: { github: "https://github.com/nogiruiz", linkedin: "https://www.linkedin.com/in/gino-ruiz-880908396", email: "nogiruiz@gmail.com" }
  },
  {
    id: 4,
    name: "Mariah Louise Alba",
    role: "Frontend Developer & UI/UX",
    contribution: "Builds responsive user interfaces, implements design systems, and creates interactive components.",
    image: MauiImg,
    social: { github: "https://github.com/mauilouisealba", linkedin: "", email: "marissalba0628@gmail.com" }
  },
  {
    id: 5,
    name: "Josef Karol Buri",
    role: "Frontend Developer & UI/UX",
    contribution: "Develops reusable UI components, optimizes frontend performance, and ensures design consistency.",
    image: JosefImg,
    social: { github: "https://github.com/josefkarollburi", linkedin: "https://www.linkedin.com/in/josef-karol-buri-76a6473ba", email: "josefkaroll.buri@gmail.com" }
  }
];

const orderedTeam = [teamMembers[2], teamMembers[1], teamMembers[0], teamMembers[3], teamMembers[4]];

const MeetTheTeam = () => {
  const defaultIndex = orderedTeam.findIndex(member => member.name === "Tyrone Sangalang");
  const [activeIndex, setActiveIndex] = useState(defaultIndex !== -1 ? defaultIndex : 2);
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [descriptionAnimation, setDescriptionAnimation] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setDescriptionAnimation(true);
    const timer = setTimeout(() => setDescriptionAnimation(false), 500);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? orderedTeam.length - 1 : prev - 1));
    setShowEmailTooltip(false);
    setCopied(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === orderedTeam.length - 1 ? 0 : prev + 1));
    setShowEmailTooltip(false);
    setCopied(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  // For mobile: show 3 members (-1, 0, 1)
  // For desktop: show 5 members (-2, -1, 0, 1, 2)
  const getVisibleMembers = () => {
    const members = [];
    const total = orderedTeam.length;
    const range = isMobile ? 1 : 2;
    for (let offset = -range; offset <= range; offset++) {
      let index = (activeIndex + offset + total) % total;
      members.push({ ...orderedTeam[index], position: offset, isCenter: offset === 0, originalIndex: index });
    }
    return members;
  };

  // Proper spacing to avoid overlap - using percentage-based positioning
  const getItemStyle = (position) => {
    if (position === 0) {
      return { 
        transform: 'translateX(0px) scale(1) translateY(-8px)', 
        opacity: 1, 
        zIndex: 30,
        position: 'relative',
        transition: 'all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)'
      };
    }
    if (Math.abs(position) === 1) {
      // First side members - properly spaced
      const translateX = position === -1 
        ? (isMobile ? '-55%' : '-120px')
        : (isMobile ? '55%' : '120px');
      const rotate = position === -1 ? '-4deg' : '4deg';
      return { 
        transform: `translateX(${translateX}) scale(${isMobile ? 0.8 : 0.85}) translateY(8px) rotate(${rotate})`, 
        opacity: isMobile ? 0.85 : 0.9, 
        zIndex: 20,
        position: 'relative',
        transition: 'all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)'
      };
    }
    if (Math.abs(position) === 2) {
      // Outer members - only visible on desktop
      const translateX = position === -2 ? '-220px' : '220px';
      const rotate = position === -2 ? '-8deg' : '8deg';
      return { 
        transform: `translateX(${translateX}) scale(0.7) translateY(16px) rotate(${rotate})`, 
        opacity: 0.5, 
        zIndex: 10,
        position: 'relative',
        transition: 'all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)'
      };
    }
    return {};
  };

  const activeMember = orderedTeam[activeIndex];
  const visibleMembers = getVisibleMembers();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isAnimating]);

  // Calculate container height based on screen size
  const containerHeight = isMobile ? '320px' : '420px';

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-[#0a0f0a] via-[#1a2415] to-[#0d140a] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#8BAE66]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-[#BBCB2E]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-gradient-radial from-[#8BAE66]/8 via-transparent to-transparent"></div>
        
        {[...Array(isMobile ? 10 : 20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#8BAE66] animate-float"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 8 + 4 + 's',
              opacity: Math.random() * 0.3 + 0.1
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-10 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-white">Meet the </span>
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#8BAE66] to-[#BBCB2E] rounded-full animate-pulse-glow"></span>
              <span className="relative bg-gradient-to-r from-[#8BAE66] to-[#BBCB2E] bg-clip-text text-transparent animate-gradient-shift">
                Creators
              </span>
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-sm animate-slideUp">
            Five passionate computer engineering students turning cooking and coding into Dishcovery
          </p>
        </div>

        <div className="relative mb-6 md:mb-8">
          <button 
            onClick={handlePrevious} 
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#8BAE66] hover:border-[#8BAE66] hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button 
            onClick={handleNext} 
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#8BAE66] hover:border-[#8BAE66] hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Use flex container with justify-center and proper gaps for spacing */}
          <div 
            className="relative flex justify-center items-center" 
            style={{ minHeight: containerHeight }}
          >
            {/* Desktop: 5 profiles with explicit gaps */}
            {!isMobile && (
              <div className="flex justify-center items-center gap-8 lg:gap-12 w-full">
                {visibleMembers.map((member, idx) => {
                  const isCenter = member.position === 0;
                  return (
                    <div
                      key={`${member.id}-${idx}`}
                      className={`flex flex-col items-center transition-all duration-500 cursor-pointer ${
                        isCenter ? 'scale-100 -translate-y-2' : 'scale-90 translate-y-2 opacity-70 hover:opacity-90 hover:scale-95'
                      }`}
                      onClick={() => {
                        if (!isAnimating && !isCenter) {
                          setIsAnimating(true);
                          setActiveIndex(member.originalIndex);
                          setShowEmailTooltip(false);
                          setTimeout(() => setIsAnimating(false), 600);
                        }
                      }}
                    >
                      <div className="relative">
                        {isCenter && (
                          <div className="absolute inset-0 rounded-full animate-pulse-glow-ring" style={{ 
                            background: 'radial-gradient(circle, rgba(139,174,102,0.4) 0%, rgba(139,174,102,0) 80%)', 
                            width: 'calc(100% + 30px)', 
                            height: 'calc(100% + 30px)', 
                            left: '-15px', 
                            top: '-15px' 
                          }} />
                        )}
                        <div className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                          isCenter 
                            ? 'ring-4 ring-[#8BAE66] ring-offset-4 ring-offset-[#0a0f0a] shadow-2xl shadow-[#8BAE66]/30 animate-glow' 
                            : 'ring-2 ring-white/20 shadow-lg hover:ring-[#8BAE66]/40'
                        }`}>
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-28 h-28 lg:w-32 lg:h-32 object-cover transition-transform duration-500 hover:scale-110" 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/128?text=No+Image'; }} 
                          />
                        </div>
                      </div>
                      {isCenter && (
                        <div className="text-center mt-3 animate-slideUp">
                          <p className="font-bold text-white text-sm lg:text-base animate-text-shine">{member.name}</p>
                          <p className="text-[#8BAE66] text-xs font-semibold mt-1">{member.role}</p>
                        </div>
                      )}
                      {!isCenter && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                          <div className="bg-[#1a2415]/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-[#8BAE66]/30">
                            {member.name.split(' ')[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile: 3 profiles with flex gaps - no overlap */}
            {isMobile && (
              <div className="flex justify-center items-center gap-6 w-full px-8">
                {visibleMembers.map((member, idx) => {
                  const isCenter = member.position === 0;
                  return (
                    <div
                      key={`${member.id}-${idx}`}
                      className={`flex flex-col items-center transition-all duration-500 cursor-pointer ${
                        isCenter 
                          ? 'scale-100 -translate-y-3 z-20' 
                          : 'scale-85 translate-y-3 opacity-80 hover:opacity-100 hover:scale-90 z-10'
                      }`}
                      onClick={() => {
                        if (!isAnimating && !isCenter) {
                          setIsAnimating(true);
                          setActiveIndex(member.originalIndex);
                          setShowEmailTooltip(false);
                          setTimeout(() => setIsAnimating(false), 600);
                        }
                      }}
                    >
                      <div className="relative">
                        {isCenter && (
                          <div className="absolute inset-0 rounded-full animate-pulse-glow-ring" style={{ 
                            background: 'radial-gradient(circle, rgba(139,174,102,0.4) 0%, rgba(139,174,102,0) 80%)', 
                            width: 'calc(100% + 20px)', 
                            height: 'calc(100% + 20px)', 
                            left: '-10px', 
                            top: '-10px' 
                          }} />
                        )}
                        <div className={`relative rounded-full overflow-hidden transition-all duration-500 ${
                          isCenter 
                            ? 'ring-3 ring-[#8BAE66] ring-offset-2 ring-offset-[#0a0f0a] shadow-2xl shadow-[#8BAE66]/30 animate-glow' 
                            : 'ring-2 ring-white/20 shadow-lg hover:ring-[#8BAE66]/40'
                        }`}>
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover transition-transform duration-500 hover:scale-105" 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/128?text=No+Image'; }} 
                          />
                        </div>
                      </div>
                      {isCenter && (
                        <div className="text-center mt-2 animate-slideUp">
                          <p className="font-bold text-white text-xs sm:text-sm animate-text-shine">{member.name}</p>
                          <p className="text-[#8BAE66] text-[10px] font-semibold mt-0.5">{member.role}</p>
                        </div>
                      )}
                      {!isCenter && (
                        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                          <div className="bg-[#1a2415]/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full border border-[#8BAE66]/30">
                            {member.name.split(' ')[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-4 md:mt-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8BAE66] to-[#BBCB2E] rounded-xl md:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-gradient"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-5 transition-all duration-300 hover:bg-white/10 hover:scale-[1.01] md:hover:scale-[1.02]">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="hidden md:block flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-[#8BAE66]/50 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:ring-[#8BAE66]">
                    <img src={activeMember?.image} alt={activeMember?.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/56?text=No+Image'; }} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1 md:gap-2 mb-1 md:mb-2">
                    <div>
                      <h3 className="text-sm md:text-lg font-bold text-white transition-all duration-300 group-hover:text-[#8BAE66]">
                        {activeMember?.name}
                      </h3>
                      <p className="text-[#8BAE66] text-[10px] md:text-xs font-semibold mt-0.5">{activeMember?.role}</p>
                    </div>
                    <div className="flex gap-2 md:gap-2.5 items-center">
                      <a href={activeMember?.social?.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12 transform">
                        <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </a>
                      {activeMember?.social?.linkedin && (
                        <a href={activeMember.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:-rotate-12 transform">
                          <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </a>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setShowEmailTooltip((prev) => !prev)}
                          className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                          aria-label="Show email"
                        >
                          <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {showEmailTooltip && (
                          <div className="absolute bottom-full right-0 mb-2 z-50 animate-slideUp">
                            <div className="bg-[#1a2415] border border-[#8BAE66]/30 text-white text-[10px] md:text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl flex items-center gap-2 backdrop-blur-sm">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(activeMember?.social?.email || '');
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-white/10 transition-colors"
                                aria-label="Copy email"
                              >
                                {copied ? <Check className="w-2.5 h-2.5 text-[#8BAE66]" /> : <Copy className="w-2.5 h-2.5 text-[#8BAE66]" />}
                              </button>
                              <span>{activeMember?.social?.email}</span>
                            </div>
                            <div className="absolute top-full right-3 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1a2415' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 md:pt-2 border-t border-white/10">
                    <p className={`text-gray-300 text-[10px] md:text-xs leading-relaxed transition-all duration-500 ${
                      descriptionAnimation 
                        ? 'animate-description-fade-in' 
                        : ''
                    }`}>
                      {activeMember?.contribution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 md:gap-2.5 mt-5 md:mt-7">
          {orderedTeam.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { 
                if (!isAnimating) {
                  setIsAnimating(true);
                  setActiveIndex(idx); 
                  setShowEmailTooltip(false);
                  setTimeout(() => setIsAnimating(false), 600);
                }
              }}
              className={`transition-all duration-300 ${
                idx === activeIndex 
                  ? 'w-5 md:w-7 h-1 md:h-1.5 bg-gradient-to-r from-[#8BAE66] to-[#BBCB2E] rounded-full animate-pulse' 
                  : 'w-1.5 md:w-2 h-1 md:h-1.5 bg-white/30 rounded-full hover:bg-white/50 hover:scale-125'
              }`}
              aria-label={`Go to member ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pulse-glow-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes descriptionFadeIn {
          0% { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes text-shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(139,174,102,0.3), 0 0 10px rgba(139,174,102,0.2); }
          50% { box-shadow: 0 0 15px rgba(139,174,102,0.5), 0 0 20px rgba(139,174,102,0.3); }
        }
        @keyframes gradient {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-pulse-glow-ring { animation: pulse-glow-ring 2s ease-in-out infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-description-fade-in { animation: descriptionFadeIn 0.4s ease-out; }
        .animate-gradient-shift { background-size: 200% auto; animation: gradient-shift 3s ease infinite; }
        .animate-text-shine { background: linear-gradient(120deg, #fff 0%, #8BAE66 50%, #fff 100%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; color: transparent; animation: text-shine 3s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-gradient { animation: gradient 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .bg-gradient-radial { background-image: radial-gradient(circle, var(--tw-gradient-stops)); }
        .scale-85 { transform: scale(0.85); }
      `}</style>
    </section>
  );
};

export default MeetTheTeam;