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
              card.classList.remove("opacity-0", "translate-y-12");
              card.classList.add("opacity-100", "translate-y-0");
            }, i * 200);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      if (card) observer.observe(card);
      return observer;
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div id="about" className="w-full bg-[#F0F5E8] py-14 px-6 sm:py-20 lg:py-24 lg:px-16">

      <div className="max-w-5xl mx-auto">

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-roboto text-[#1B211A] mb-3">
          Why Use Dishcovery?
        </h2>

        <p className="text-sm sm:text-base lg:text-lg font-freeman font-semibold text-[#1B211A] mb-10 sm:mb-14">
          Dishcovery makes finding the{" "}
          <span className="text-[#BBCB2E] italic">perfect recipe</span>{" "}
          easier than ever.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col gap-4 opacity-0 translate-y-12 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            >
              <div className="flex flex-row items-center gap-3">
                <div className="p-2 bg-[#F0F5E8] rounded-xl flex-shrink-0">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold font-roboto text-[#1B211A] leading-snug">
                  {feature.title}
                </h3>
              </div>

              <hr className="border-gray-200" />

              <p className="text-xs sm:text-sm text-gray-500 font-freeman leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AboutSection;