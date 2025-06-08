import * as React from "react";
import { useNavigate } from "react-router-dom";

export function Navigation() {
    const Navigate = useNavigate();
  return (
    <header className="overflow-hidden relative pt-4 font-medium leading-none bg-sky-50 max-md:max-w-full">
      <div className="flex overflow-hidden relative flex-col px-16 pt-3.5 pb-7 w-full min-h-[97px] max-md:px-5 max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/c0d088dffeba3e08eecce80369250cc144d64098?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 size-full"
        />
        <nav className="flex relative flex-wrap gap-10 justify-between items-center w-full max-w-[1292px] max-md:max-w-full">
          <div className="flex overflow-hidden gap-1 items-center self-stretch py-2 my-auto text-2xl font-semibold rounded text-blue-950">
            <div className="flex gap-2 items-center self-stretch my-auto">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/38c2f2aaebbc362a76e260b7e7db0b3d11e2ea0f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                className="object-contain shrink-0 self-stretch my-auto w-9 aspect-square"
              />
              <div className="flex gap-1 items-start self-stretch my-auto">
                <span>Language </span>
                <span>Planet</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 items-center self-stretch my-auto text-xl text-gray-600 min-w-60">
            <a href="#" className="gap-2 self-stretch my-auto whitespace-nowrap rounded-lg">
              Home
            </a>
            <a href="#" className="gap-2 self-stretch my-auto whitespace-nowrap rounded-lg">
              Pricing
            </a>
            <a href="#" className="gap-2 self-stretch my-auto rounded-lg">
              Contact Us
            </a>
          </div>
          <div className="flex gap-4 items-start self-stretch my-auto text-base min-w-60">
            <button className="gap-2 self-stretch px-6 py-4 text-blue-600 bg-white rounded-lg border border-solid border-[color:var(--Primary-600,#0D74FA)] max-md:px-5" onClick={() => Navigate('/login')}>
              Log In
            </button>
            <button className="gap-2 self-stretch px-6 py-4 bg-blue-600 rounded-lg text-neutral-100 max-md:px-5" onClick={() => Navigate('/login')}>
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
