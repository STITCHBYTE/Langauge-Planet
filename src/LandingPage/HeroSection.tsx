import * as React from "react";
import { useNavigate } from "react-router-dom";
export function HeroSection() {
        const Navigate = useNavigate();
  return (
    <section className="relative self-center mt-24 ml-4 w-full max-w-[1322px] max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-5 max-md:flex-col max-md:">
        <div className="w-[58%] max-md:ml-0 max-md:w-full">
          <div className="relative z-10 grow max-md:-mr-1 max-md:max-w-full">
            <div className="flex flex-col w-full max-md:max-w-full">
              <header className="max-w-full w-[802px]">
                <h1 className="text-7xl font-semibold text-blue-900 leading-[90px] max-md:max-w-full max-md:text-4xl max-md:leading-[55px]">
                  Learn, Play, Connect! <br />
                  The Enjoyable Way To
                  <br />
                  <span style={{color: "rgba(13,116,250,1)"}}>
                    Learn New Languages.
                  </span>
                </h1>
                <p className="mt-4 text-xl font-medium tracking-tight leading-8 text-slate-600 max-md:max-w-full">
                  Start your language learning journey with Language
                  Planet! Whether you're a student eager to explore new
                  languages or a teacher looking to inspire your
                  students, we've got you covered.
                </p>
              </header>
              <button className="flex gap-2 justify-center items-center self-start px-6 py-4 mt-10 text-base font-medium leading-none bg-blue-600 rounded-lg text-neutral-100 max-md:px-5">
                <span className="self-stretch my-auto" onClick={() => Navigate('/login')}>
                  Get Started For Free
                </span>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/69ea85d21d40dc0f4240bf300c302574fc075220?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                  className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                />
              </button>
            </div>
            <div className="mt-8 max-w-full text-xl font-medium tracking-tight text-slate-600 w-[185px]">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/ac8aa67b23d2420ff44f34662161b98a904dea4f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                className="object-contain gap-0 w-full aspect-[4.63]"
              />
              <p className="mt-2">
                Worldwide Learners
              </p>
            </div>
          </div>
        </div>
        <div className="ml-5 w-[42%] max-md:ml-0 max-md:w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c13014bf33b20ce2a0d145a0d3aebb31d4dd461f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
            className="object-contain w-full aspect-square max-md:max-w-full"
          />
        </div>
      </div>
    </section>
  );
}
