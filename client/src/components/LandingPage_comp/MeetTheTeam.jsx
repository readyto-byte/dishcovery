import React, { useState } from 'react';

// Simple SVG Icons
const ChevronLeft = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const Github = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
const Linkedin = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Mail = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const Sparkles = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z"></path><path d="M19 4L20 7L23 8L20 9L19 12L18 9L15 8L18 7L19 4Z"></path></svg>;

const teamMembers = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Frontend Lead",
    contribution: "Architected responsive UI components and implemented the recipe carousel. Passionate about creating seamless experiences with React and Tailwind.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    social: { github: "#", linkedin: "#", email: "alex@dishcovery.com" }
  },
  {
    id: 2,
    name: "Jordan Lee",
    role: "Backend Engineer",
    contribution: "Built the recipe recommendation engine and database architecture. Loves optimizing API responses with Python/FastAPI.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    social: { github: "#", linkedin: "#", email: "jordan@dishcovery.com" }
  },
  {
    id: 3,
    name: "Casey Morgan",
    role: "AI/ML Specialist",
    contribution: "Developed ingredient-to-recipe matching using NLP. Enjoys experimenting with new models to personalize recommendations.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    social: { github: "#", linkedin: "#", email: "casey@dishcovery.com" }
  },
  {
    id: 4,
    name: "Taylor Chen",
    role: "Product Designer",
    contribution: "Designed the visual identity, user flows, and interactive prototypes. Focuses on making cooking accessible and delightful.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    social: { github: "#", linkedin: "#", email: "taylor@dishcovery.com" }
  },
  {
    id: 5,
    name: "Riley Smith",
    role: "DevOps & QA",
    contribution: "Set up deployment pipelines and ensures smooth releases. Tests recipes IRL to guarantee instructions are foolproof!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    social: { github: "#", linkedin: "#", email: "riley@dishcovery.com" }
  }
];

const MeetTheTeam = () => {
  const [activeIndex, setActiveIndex] = useState(2);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? teamMembers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === teamMembers.length - 1 ? 0 : prev + 1));
  };

  const getVisibleMembers = () => {
    const members = [];
    const total = teamMembers.length;
    
    for (let offset = -2; offset <= 2; offset++) {
      let index = (activeIndex + offset + total) % total;
      let position = offset;
      
      members.push({
        ...teamMembers[index],
        position,
        isCenter: offset === 0,
        originalIndex: index
      });
    }
    
    return members;
  };

  const getItemStyle = (position) => {
    const absPosition = Math.abs(position);
    
    if (position === 0) {
      return {
        transform: 'translateX(0px) scale(1) translateY(-8px)',
        opacity: 1,
        zIndex: 30,
      };
    } else if (absPosition === 1) {
      const translateX = position === -1 ? -130 : 130;
      return {
        transform: `translateX(${translateX}px) scale(0.85) translateY(8px)`,
        opacity: 0.85,
        zIndex: 20,
      };
    } else {
      const translateX = position === -2 ? -240 : 240;
      return {
        transform: `translateX(${translateX}px) scale(0.7) translateY(20px)`,
        opacity: 0.4,
        zIndex: 10,
      };
    }
  };

  const activeMember = teamMembers[activeIndex];
  const visibleMembers = getVisibleMembers();

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#FDFBF7] to-white relative overflow-hidden">
      {/* Animated Background - WOW FACTOR 1 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-[#839705]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#2D3A18]/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        
        {/* Spotlight effect for center member */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-[#839705]/10 via-transparent to-transparent pointer-events-none transition-all duration-500"
          style={{
            opacity: 1,
            animation: 'spotlightPulse 2s ease-in-out infinite'
          }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with animated underline - WOW FACTOR 2 */}
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

        {/* Pyramid Carousel */}
        <div className="relative mb-6">
          {/* Navigation Arrows with hover effects */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-[#2D3A18] hover:bg-[#839705] hover:text-white hover:border-[#839705] hover:scale-110 transition-all duration-300 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 group-hover:animate-pulse" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-[#2D3A18] hover:bg-[#839705] hover:text-white hover:border-[#839705] hover:scale-110 transition-all duration-300 group"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 group-hover:animate-pulse" />
          </button>

          {/* Members Row */}
          <div className="relative flex justify-center items-center min-h-[320px]">
            {visibleMembers.map((member) => {
              const style = getItemStyle(member.position);
              
              return (
                <div
                  key={`${member.id}-${member.position}`}
                  className="absolute transition-all duration-500 ease-out cursor-pointer group"
                  style={{
                    transform: style.transform,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)'
                  }}
                  onClick={() => setActiveIndex(member.originalIndex)}
                >
                  <div className="flex flex-col items-center">
                    {/* Glowing ring effect for center member - WOW FACTOR 3 */}
                    <div className="relative">
                      {member.isCenter && (
                        <div className="absolute inset-0 rounded-full animate-ping-slow opacity-75" style={{
                          background: 'radial-gradient(circle, rgba(131,151,5,0.3) 0%, rgba(131,151,5,0) 70%)',
                          width: 'calc(100% + 20px)',
                          height: 'calc(100% + 20px)',
                          left: '-10px',
                          top: '-10px',
                        }}></div>
                      )}
                      
                      <div className={`
                        relative rounded-full overflow-hidden transition-all duration-300
                        ${member.isCenter 
                          ? 'ring-4 ring-[#839705] ring-offset-4 ring-offset-white shadow-2xl animate-glow' 
                          : 'ring-2 ring-white/60 shadow-lg group-hover:ring-[#839705]/40 group-hover:scale-105'
                        }
                      `}>
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-28 h-28 md:w-32 md:h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {member.isCenter && (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#839705]/30 via-transparent to-transparent pointer-events-none"></div>
                        )}
                      </div>
                    </div>
                    
                    {member.isCenter ? (
                      <div className="text-center mt-2 animate-slideUp">
                        <p className="font-bold text-[#2D3A18] text-base animate-textShine">{member.name}</p>
                        <p className="text-[#839705] text-xs font-semibold">{member.role}</p>
                      </div>
                    ) : (
                      <div className="text-center mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translateY-2">
                        <p className="font-medium text-gray-700 text-xs">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.role.split(' ')[0]}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Card with 3D tilt effect - WOW FACTOR 4 */}
        <div className="max-w-2xl mx-auto">
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-all duration-500 hover:shadow-2xl hover:scale-105 group transform-gpu"
            style={{
              animation: 'slideUpFade 0.4s ease-out forwards'
            }}
          >
            <div className="flex items-start gap-4">
              {/* Animated Avatar in card */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#839705]/20 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <img src={activeMember.image} alt={activeMember.name} className="w-full h-full object-cover" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3A18] transition-colors duration-300 group-hover:text-[#839705]">
                      {activeMember.name}
                    </h3>
                    <p className="text-[#839705] text-xs font-semibold">{activeMember.role}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={activeMember.social.github} className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={activeMember.social.linkedin} className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={`mailto:${activeMember.social.email}`} className="text-gray-400 hover:text-[#2D3A18] transition-all duration-300 hover:scale-125 transform inline-block">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed transition-all duration-300 group-hover:text-gray-700">
                    {activeMember.contribution}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Dots with animation */}
        <div className="flex justify-center gap-1.5 mt-5">
          {teamMembers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex
                  ? 'w-6 h-1.5 bg-[#839705] animate-pulse'
                  : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400 hover:scale-125 transform'
              }`}
              aria-label={`Go to member ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spotlightPulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(131,151,5,0.3), 0 0 10px rgba(131,151,5,0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(131,151,5,0.6), 0 0 30px rgba(131,151,5,0.3);
          }
        }
        
        @keyframes textShine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-textShine {
          background: linear-gradient(120deg, #2D3A18 0%, #839705 50%, #2D3A18 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: textShine 3s linear infinite;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-bounce-subtle {
          animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          75%, 100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        
        .bg-gradient-radial {
          background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default MeetTheTeam;