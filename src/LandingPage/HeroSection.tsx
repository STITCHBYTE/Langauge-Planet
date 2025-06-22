import * as React from "react";
import { useNavigate } from "react-router-dom";
export function HeroSection() {
  const Navigate = useNavigate();
  return (
    <section className="relative flex justify-center items-center mt-16 md:mt-24 w-full px-2 sm:px-4 md:px-8 max-w-[1322px] mx-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-5 w-full items-center">
        {/* Left: Text Content */}
        <div className="w-full md:w-3/5 flex flex-col items-start">
          <header className="w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-blue-900 leading-tight md:leading-[90px]">
              Learn, Play, Connect! <br />
              The Enjoyable Way To
              <br />
              <span className="text-blue-600">
                Learn New Languages.
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl font-medium tracking-tight leading-7 md:leading-8 text-slate-600">
              Start your language learning journey with Language Planet! Whether you're a student eager to explore new languages or a teacher looking to inspire your students, we've got you covered.
            </p>
          </header>
          <button
            className="flex gap-2 justify-center items-center px-6 py-4 mt-8 text-base font-medium leading-none bg-blue-600 rounded-lg text-neutral-100 hover:bg-blue-700 transition"
            onClick={() => Navigate('/login')}
          >
            <span>Get Started For Free</span>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/69ea85d21d40dc0f4240bf300c302574fc075220?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
              className="object-contain w-5 h-5"
              alt="Arrow"
            />
          </button>
          <div className="mt-8 flex flex-col items-start">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ac8aa67b23d2420ff44f34662161b98a904dea4f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
              className="object-contain w-40 sm:w-48"
              alt="Worldwide Learners"
            />
            <p className="mt-2 text-base sm:text-lg font-medium tracking-tight text-slate-600">
              Worldwide Learners
            </p>
          </div>
        </div>
        {/* Right: Hero Image */}
        <div className="w-full md:w-2/5 flex justify-center md:justify-end">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c13014bf33b20ce2a0d145a0d3aebb31d4dd461f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
            className="object-contain w-full max-w-xs sm:max-w-sm md:max-w-full aspect-square"
            alt="Hero"
          />
        </div>
      </div>
    </section>
  );
}
