import React, { useState } from 'react';

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
const Sparkles = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z"></path><path d="M19 4L20 7L23 8L20 9L19 12L18 9L15 8L18 7L19 4Z"></path></svg>;

const teamMembers = [
  {
    id: 1,
    name: "Tyrone Jonel Sangalang",
    role: "Lead Backend Software Developer",
    contribution: "Leads the backend development team, designs system architecture, and ensures robust API performance. Oversees database management and server-side logic to deliver scalable solutions.",
    image: TyroneImg,
    social: { github: "https://github.com/readyto-byte", linkedin: "https://www.linkedin.com/in/tyrone-sangalang/", email: "sangalang.tyronel@gmail.com" }
  },
  {
    id: 2,
    name: "Rachelle Joy Quinto",
    role: "Lead Frontend Developer & UI/UX Designer",
    contribution: "Leads the frontend team, establishes UI/UX standards, and designs intuitive user interfaces. Ensures seamless user experiences across all devices through thoughtful design and development.",
    image: RachelleImg,
    social: { github: "https://github.com/r-quinto", linkedin: "https://www.linkedin.com/in/rachelle-quinto-0017433a9?fbclid=IwY2xjawRVZV5leHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEe0slIEeZWpt1DfY89CLjHi2cb54CKadcG2sfzEaIPBBdNw1nzYAs2dfogTuQ_aem_ZmFrZWR1bW15MTZieXRlcw", email: "rshlquinto@gmail.com" }
  },
  {
    id: 3,
    name: "Gino Ruiz",
    role: "Backend Software Developer",
    contribution: "Develops and maintains backend services, optimizes database queries, and implements API endpoints. Focuses on creating efficient and secure server-side functionality.",
    image: GinoImg,
    social: { github: "https://github.com/nogiruiz", linkedin: "https://www.linkedin.com/in/gino-ruiz-880908396?fbclid=IwY2xjawRVZIBleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeT2-llBihUqFIBNeZ1prS8QQXT6hI6vY9iEHvQFXjx_CZGXej785JydeHiBc_aem_2aDQg4s2SgNtsXX5LolMpQ", email: "nogiruiz@gmail.com" }
  },
  {
    id: 4,
    name: "Mariah Louise Alba",
    role: "Frontend Developer & UI/UX Designer",
    contribution: "Builds responsive user interfaces, implements design systems, and creates interactive components. Collaborates on UI/UX decisions to deliver engaging and accessible web experiences.",
    image: MauiImg,
    social: { github: "https://github.com/mauilouisealba", linkedin: "", email: "marissalba0628@gmail.com" }
  },
  {
    id: 5,
    name: "Josef Karol Buri",
    role: "Frontend Developer & UI/UX Designer",
    contribution: "Develops reusable UI components, optimizes frontend performance, and ensures design consistency. Contributes to user research and implements visually appealing interfaces.",
    image: JosefImg,
    social: { github: "https://github.com/josefkarollburi", linkedin: "https://www.linkedin.com/in/josef-karol-buri-76a6473ba?fbclid=IwY2xjawRVZXdleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeb2aeNykETvPzu2l78_664oybzWFRhXs7gAN2WLsc3gLBUc18xBIIyHMx734_aem_XsNIZMZcvM7mTJgATIqiow", email: "josefkaroll.buri@gmail.com" }
  }
];

const orderedTeam = [teamMembers[2], teamMembers[1], teamMembers[0], teamMembers[3], teamMembers[4]];

const MeetTheTeam = () => {
  const defaultIndex = orderedTeam.findIndex(member => member.name === "Tyrone Jonel Sangalang");
  const [activeIndex, setActiveIndex] = useState(defaultIndex !== -1 ? defaultIndex : 2);
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? orderedTeam.length - 1 : prev - 1));
    setShowEmailTooltip(false);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === orderedTeam.length - 1 ? 0 : prev + 1));
    setShowEmailTooltip(false);
  };

  const getVisibleMembers = () => {
    const members = [];
    const total = orderedTeam.length;
    for (let offset = -2; offset <= 2; offset++) {
      let index = (activeIndex + offset + total) % total;
      members.push({ ...orderedTeam[index], position: offset, isCenter: offset === 0, originalIndex: index });
    }
    return members;
  };

  const getItemStyle = (position) => {
    const absPosition = Math.abs(position);
    if (position === 0) return { transform: 'translateX(0px) scale(1) translateY(-8px)', opacity: 1, zIndex: 30 };
    if (absPosition === 1) {
      const translateX = position === -1 ? -130 : 130;
      return { transform: `translateX(${translateX}px) scale(0.85) translateY(8px)`, opacity: 0.85, zIndex: 20 };
    }
    const translateX = position === -2 ? -240 : 240;
    return { transform: `translateX(${translateX}px) scale(0.7) translateY(20px)`, opacity: 0.4, zIndex: 10 };
  };

  const activeMember = orderedTeam[activeIndex];
  const visibleMembers = getVisibleMembers();

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#FDFBF7] to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-[#839705]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#2D3A18]/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-[#839705]/10 via-transparent to-transparent pointer-events-none transition-all duration-500" style={{ opacity: 1, animation: 'spotlightPulse 2s ease-in-out infinite' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#839705]/10 border border-[#839705]/20 mb-3 animate-bounce-subtle">
            <Sparkles className="w-3.5 h-3.5 text-[#839705] animate-spin-slow" />
            <span className="text-xs font-semibold text-[#839705] tracking-wide uppercase">The Dream Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D3A18] mb-2">
            Meet the <span className="text-[#839705] relative inline-block">
              Creators
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#839705] transform scale-x-0 transition-transform duration-500 origin-left" style={{ transform: 'scaleX(1)' }}></span>
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Five passionate computer engineering students turning cooking and coding into Dishcovery
          </p>
        </div>

        <div className="relative mb-6">
          <button onClick={handlePrevious} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-[#2D3A18] hover:bg-[#839705] hover:text-white hover:border-[#839705] hover:scale-110 transition-all duration-300 group" aria-label="Previous">
            <ChevronLeft className="w-5 h-5 group-hover:animate-pulse" />
          </button>
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-[#2D3A18] hover:bg-[#839705] hover:text-white hover:border-[#839705] hover:scale-110 transition-all duration-300 group" aria-label="Next">
            <ChevronRight className="w-5 h-5 group-hover:animate-pulse" />
          </button>

          <div className="relative flex justify-center items-center min-h-[320px]">
            {visibleMembers.map((member) => {
              const style = getItemStyle(member.position);
              return (
                <div
                  key={`${member.id}-${member.position}`}
                  className="absolute transition-all duration-500 ease-out cursor-pointer group"
                  style={{ transform: style.transform, opacity: style.opacity, zIndex: style.zIndex, transition: 'all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
                  onClick={() => { setActiveIndex(member.originalIndex); setShowEmailTooltip(false); }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {member.isCenter && (
                        <div className="absolute inset-0 rounded-full animate-ping-slow opacity-75" style={{ background: 'radial-gradient(circle, rgba(131,151,5,0.3) 0%, rgba(131,151,5,0) 70%)', width: 'calc(100% + 20px)', height: 'calc(100% + 20px)', left: '-10px', top: '-10px' }}></div>
                      )}
                      <div className={`relative rounded-full overflow-hidden transition-all duration-300 ${member.isCenter ? 'ring-4 ring-[#839705] ring-offset-4 ring-offset-white shadow-2xl animate-glow' : 'ring-2 ring-white/60 shadow-lg group-hover:ring-[#839705]/40 group-hover:scale-105'}`}>
                        <img src={member.image} alt={member.name} className="w-28 h-28 md:w-32 md:h-32 object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = 'https://via.placeholder.com/128?text=No+Image'; }} />
                        {member.isCenter && <div className="absolute inset-0 bg-gradient-to-t from-[#839705]/30 via-transparent to-transparent pointer-events-none"></div>}
                      </div>
                    </div>
                    {member.isCenter && (
                      <div className="text-center mt-2 animate-slideUp">
                        <p className="font-bold text-[#2D3A18] text-base animate-textShine">{member.name}</p>
                        <p className="text-[#839705] text-xs font-semibold">{member.role}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-all duration-500 hover:shadow-2xl hover:scale-105 group transform-gpu" style={{ animation: 'slideUpFade 0.4s ease-out forwards' }}>
            <div className="flex items-start gap-4">
              <div className="hidden md:block flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#839705]/20 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <img src={activeMember?.image} alt={activeMember?.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/56?text=No+Image'; }} />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3A18] transition-colors duration-300 group-hover:text-[#839705]">{activeMember?.name}</h3>
                    <p className="text-[#839705] text-xs font-semibold">{activeMember?.role}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <a href={activeMember?.social?.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block">
                      <Github className="w-4 h-4" />
                    </a>
                    {activeMember?.social?.linkedin && (
                      <a href={activeMember.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmailTooltip((prev) => !prev)}
                        className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block cursor-pointer"
                        aria-label="Show email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {showEmailTooltip && (
                        <div className="absolute bottom-full right-0 mb-2 z-50 animate-slideUp">
                          <div className="bg-[#2D3A18] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl flex items-center gap-2">
                            <Mail className="w-3 h-3 text-[#839705] shrink-0" />
                            <a
                              href={`mailto:${activeMember?.social?.email}`}
                              className="hover:text-[#B5D098] transition-colors underline underline-offset-2"
                            >
                              {activeMember?.social?.email}
                            </a>
                          </div>
                          <div className="absolute top-full right-3 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #2D3A18' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed transition-all duration-300 group-hover:text-gray-700">{activeMember?.contribution}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-5">
          {orderedTeam.map((_, idx) => (
            <button key={idx} onClick={() => { setActiveIndex(idx); setShowEmailTooltip(false); }} className={`transition-all duration-300 rounded-full ${idx === activeIndex ? 'w-6 h-1.5 bg-[#839705] animate-pulse' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400 hover:scale-125 transform'}`} aria-label={`Go to member ${idx + 1}`} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spotlightPulse { 0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(131,151,5,0.3), 0 0 10px rgba(131,151,5,0.2); } 50% { box-shadow: 0 0 20px rgba(131,151,5,0.6), 0 0 30px rgba(131,151,5,0.3); } }
        @keyframes textShine { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 75%, 100% { transform: scale(1.3); opacity: 0; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .animate-ping-slow { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-textShine { background: linear-gradient(120deg, #2D3A18 0%, #839705 50%, #2D3A18 100%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; color: transparent; animation: textShine 3s linear infinite; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-bounce-subtle { animation: bounce 2s ease-in-out infinite; }
        .bg-gradient-radial { background-image: radial-gradient(circle, var(--tw-gradient-stops)); }
      `}</style>
    </section>
  );
};

export default MeetTheTeam;