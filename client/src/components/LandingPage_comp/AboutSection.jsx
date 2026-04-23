import { useEffect, useRef } from "react";
import { Bot, Search, Salad } from "lucide-react";

const features = [
  {
    icon: <Bot size={28} className="text-[#3d5e28]" />,
    title: "AI-powered recipe suggestions",
    description:
      "Get recipes based on what you want to eat and the ingredients you already have at home. Dishcovery helps you find meals that match your taste, preferences, and everyday cooking needs.",
  },
  {
    icon: <Search size={28} className="text-[#3d5e28]" />,
    title: "Simple and fast search",
    description:
      "Find the perfect dish in just a few seconds. Just type an ingredient, a meal name, or what you're craving, and Dishcovery will instantly show recipes that are easy to follow and quick to prepare.",
  },
  {
    icon: <Salad size={28} className="text-[#3d5e28]" />,
    title: "Healthy and easy meals",
    description:
      "Discover recipes that are simple, healthy, and beginner-friendly. Whether you're trying to eat better or just want something quick to cook, Dishcovery helps you find meals that are both nutritious and delicious.",
  },
];

const AboutSection = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              card.classList.remove("opacity-0", "translate-y-12", "scale-95");
              card.classList.add("opacity-100", "translate-y-0", "scale-100");
            }, i * 150);
            observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      );
      if (card) observer.observe(card);
      return observer;
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div id="about" className="relative w-full bg-gradient-to-br from-[#F5F8F0] to-[#EDF3E6] py-12 px-6 sm:py-16 lg:py-20 lg:px-16 overflow-hidden">

      <div className="absolute top-20 right-10 w-64 h-64 bg-[#8BAE66]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#BBCB2E]/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative">

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B211A]">
            Why Use{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-lg bg-[#8BAE66]/30 rounded-full"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#6B8F4A] to-[#8BAE66]">
                Dishcovery?
              </span>
            </span>
          </h2>
        </div>

        <p className="text-center text-base sm:text-lg font-medium text-gray-700 mb-10 max-w-2xl mx-auto">
          Dishcovery makes finding the{" "}
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8BAE66] to-[#6B8F4A]">
            perfect recipe
          </span>{" "}
          easier than ever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-500 opacity-0 translate-y-12 scale-95 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex flex-col gap-3">
                <div className="flex-shrink-0">
                  <div className="inline-flex p-2.5 bg-[#F0F5E8] rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[#8BAE66]/20">
                    {feature.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#1B211A] mb-2 transition-colors duration-300 group-hover:text-[#8BAE66]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;