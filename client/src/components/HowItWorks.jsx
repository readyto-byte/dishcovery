import { KeyboardIcon, Sparkles, UtensilsCrossed } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Enter ingredients or a dish name",
    description: "Tell us what you have at home or what you feel like eating.",
    icon: <KeyboardIcon size={28} />,
  },
  {
    number: 2,
    title: "Let Dishcovery analyze it",
    description: "Our AI finds the best recipes that match your ingredients.",
    icon: <Sparkles size={28} />,
  },
  {
    number: 3,
    title: "Get recipes made just for you",
    description: "Discover simple, healthy, and delicious dishes instantly.",
    icon: <UtensilsCrossed size={28} />,
  },
];

const HowItWorks = () => {
  return (
    <div className="relative w-full bg-gradient-to-b from-[#8BAE66] to-[#2B3D1A] py-14 px-6 sm:py-20 lg:py-24 lg:px-16">

      <div className="relative flex flex-col items-start max-w-xl lg:max-w-2xl mx-auto w-full">

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-roboto text-white mb-8 lg:-ml-20">
          How it works
        </h2>

        <p className="text-center w-full text-sm sm:text-base lg:text-lg font-freeman font-semibold text-white mb-8">
          Find the{" "}
          <span className="text-[#BBCB2E] italic">perfect recipe</span>{" "}
          in just a few seconds.
        </p>

        <div className="flex flex-col gap-4 lg:gap-5 w-full">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-center gap-4 bg-[#F5EFD8]/90 rounded-xl px-5 py-4 lg:px-7 lg:py-5 shadow-md"
            >
 
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-[#2B3D1A] flex items-center justify-center">
                <span className="text-white font-bold font-roboto text-lg lg:text-xl leading-none">
                  {step.number}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm lg:text-base font-bold text-[#1B211A] font-roboto leading-snug">
                  {step.title}
                </p>
                <p className="text-xs lg:text-sm text-[#4a4a4a] font-freeman mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 text-[#2B3D1A] opacity-80">
                {step.icon}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;