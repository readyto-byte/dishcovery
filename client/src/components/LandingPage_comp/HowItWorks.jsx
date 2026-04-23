import { useEffect, useRef } from "react";
import { KeyboardIcon, Sparkles, UtensilsCrossed } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Enter ingredients or a dish name",
    description: "Tell us what you have at home or what you feel like eating.",
    icon: <KeyboardIcon size={24} strokeWidth={1.5} />,
  },
  {
    number: 2,
    title: "Let Dishcovery analyze it",
    description: "Our AI finds the best recipes that match your ingredients.",
    icon: <Sparkles size={24} strokeWidth={1.5} />,
  },
  {
    number: 3,
    title: "Get recipes made just for you",
    description: "Discover simple, healthy, and delicious dishes instantly.",
    icon: <UtensilsCrossed size={24} strokeWidth={1.5} />,
  },
];

const HowItWorks = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              card.classList.remove("opacity-0", "translate-y-6");
              card.classList.add("opacity-100", "translate-y-0");
            }, i * 150);
            observer.disconnect();
          }
        },
        { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
      );
      observer.observe(card);
      return observer;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <div
      id="how-it-works"
      className="relative w-full overflow-hidden py-20 px-6 sm:py-24 lg:py-28 lg:px-16"
      style={{
        background: "linear-gradient(145deg, #2d4a1a 0%, #1a3310 50%, #0f2408 100%)",
      }}
    >

      <div
        className="pointer-events-none absolute -top-16 -right-16 rounded-full animate-pulse"
        style={{
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(187,203,46,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 rounded-full"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(131,151,5,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(187,203,46,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">


        <div className="mb-12 text-center">
          <h2
            className="mb-3 text-4xl font-bold sm:text-5xl lg:text-6xl"
            style={{ color: "#F5F0E8", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            How It{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-xl bg-[#BBCB2E]/40 rounded-full"></span>
              <span style={{ color: "#D4E67B" }}>Works</span>
            </span>
          </h2>
          <div
            className="mx-auto rounded-full"
            style={{
              width: 60,
              height: 3,
              background: "linear-gradient(to right, #D4E67B, #839705, transparent)",
            }}
          />
        </div>

        <p
          className="mb-12 max-w-md text-center text-base font-medium sm:text-lg"
          style={{ color: "rgba(245,240,232,0.75)" }}
        >
          Find the{" "}
          <span className="font-bold" style={{ color: "#D4E67B" }}>
            perfect recipe
          </span>{" "}
          in just a few seconds.
        </p>


        <div className="w-full max-w-2xl mx-auto">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div
                key={step.number}
                ref={(el) => (cardRefs.current[i] = el)}
                className="group flex gap-5 opacity-0 translate-y-6 transition-all duration-700 ease-out"
              >

                <div className="flex w-14 flex-shrink-0 flex-col items-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #D4E67B 0%, #839705 100%)",
                      color: "#1a2e0a",
                      boxShadow: "0 4px 16px rgba(212,230,123,0.25)",
                    }}
                  >
                    {step.number}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 my-2"
                      style={{
                        background: "linear-gradient(to bottom, rgba(212,230,123,0.4), rgba(212,230,123,0.05))",
                      }}
                    />
                  )}
                </div>

                <div className={`flex-1 ${!isLast ? "pb-10" : ""}`}>
                  <div
                    className="relative overflow-hidden rounded-2xl p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                      e.currentTarget.style.borderColor = "rgba(212,230,123,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 -translate-x-full -translate-y-full rotate-45 transition-transform duration-1000 group-hover:translate-x-full group-hover:translate-y-full"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.3), transparent)",
                      }}
                    />

                    <div className="flex items-center gap-4">

                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          background: "rgba(212,230,123,0.25)",
                          color: "#D4E67B",
                        }}
                      >
                        {step.icon}
                      </div>

                      <div className="flex-1">
                        <h3
                          className="mb-1 text-base font-bold sm:text-lg transition-all duration-300 group-hover:text-[#D4E67B]"
                          style={{ color: "#F5F0E8" }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-xs sm:text-sm leading-relaxed transition-all duration-300"
                          style={{ color: "rgba(245,240,232,0.7)" }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4E67B] via-[#839705] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;