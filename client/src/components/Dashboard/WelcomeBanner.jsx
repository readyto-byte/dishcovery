const WelcomeBanner = () => {
  return (
    <div className="relative mx-4 md:mx-8 mt-6 mb-8 overflow-hidden rounded-2xl shadow-xl welcome-bg">
      <div className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
          <h1 className="font-fredoka-one text-5xl md:text-7xl lg:text-8xl text-black drop-shadow-md">Welcome</h1>
          <h1 className="font-fredoka-one text-5xl md:text-7xl lg:text-8xl text-[#F0E6D1] drop-shadow-md">Tyrone!</h1>
        </div>
        <p className="text-black font-semibold text-xl md:text-2xl lg:text-3xl mt-4 max-w-3xl leading-tight">
          Ready to create something delicious today? Discover new recipes, manage your favorites, and plan your meals with AI.
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;