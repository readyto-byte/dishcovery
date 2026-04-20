import heroBg from "../../assets/hero-bg.jpg";

const WelcomeBanner = () => {
  return (
    <div
      className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />

      <div className="relative px-8 py-7 flex items-center gap-5">
        <div>
          <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
            Welcome <span className="text-[#B5D098]">Tyrone!</span>
          </h1>
          <p className="text-[#B5D098] text-sm mt-1">
            Ready to create something delicious today? Discover new recipes, manage your favorites, and plan your meals with AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;