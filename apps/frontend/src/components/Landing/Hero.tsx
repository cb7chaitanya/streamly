const Hero = () => {
  return (
    <div className="text-center mb-16">
      <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
        Stream to YouTube <br />
        Directly from Your Browser
      </h2>
      <p className="text-xl md:text-2xl mb-8 font-light text-gray-400 max-w-3xl mx-auto">
        Experience the future of live streaming with Streamly. No downloads, no
        hassle - just pure, instant broadcasting power.
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
        Start Streaming Now
      </button>
    </div>
  );
};

export default Hero;
