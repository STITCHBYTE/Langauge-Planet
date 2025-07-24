import * as React from "react";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const Navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="overflow-hidden relative pt-4 font-medium leading-none bg-sky-50 w-full">
      <div className="flex overflow-hidden relative flex-col px-4 sm:px-8 lg:px-16 pt-3.5 pb-7 w-full min-h-[97px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/c0d088dffeba3e08eecce80369250cc144d64098?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 w-full h-full"
          alt="Background"
        />
        <nav className="flex flex-row flex-wrap gap-4 sm:gap-8 justify-between items-center w-full max-w-[1292px] mx-auto relative z-10">
          <div className="flex gap-2 items-center py-2 text-2xl font-semibold rounded text-blue-950">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/38c2f2aaebbc362a76e260b7e7db0b3d11e2ea0f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
              className="object-contain w-9 aspect-square"
              alt="Logo"
            />
            <span>Language Planet</span>
          </div>
          <div className="hidden md:flex flex-row gap-2 sm:gap-6 items-center text-xl text-gray-600">
            <a href="#" className="whitespace-nowrap rounded-lg px-2 py-1 hover:bg-blue-100 transition">Home</a>
            <a href="#" className="whitespace-nowrap rounded-lg px-2 py-1 hover:bg-blue-100 transition">Pricing</a>
            <a href="#" className="rounded-lg px-2 py-1 hover:bg-blue-100 transition">Contact Us</a>
          </div>
          <div className="hidden md:flex flex-row gap-2 sm:gap-4 items-center text-base">
            <button
              className="px-6 py-2 text-blue-600 bg-white rounded-lg border border-blue-600 hover:bg-blue-50 transition"
              onClick={() => Navigate('/login')}
            >
              Log In
            </button>
            <button
              className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
              onClick={() => Navigate('/login')}
            >
              Get Started
            </button>
          </div>
          <button
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-blue-950 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-blue-950 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-blue-950 transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </nav>
        {isMobileMenuOpen && (
          <div className="md:hidden relative z-20 mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-lg text-gray-600 hover:text-blue-600 transition">Home</a>
              <a href="#" className="text-lg text-gray-600 hover:text-blue-600 transition">Pricing</a>
              <a href="#" className="text-lg text-gray-600 hover:text-blue-600 transition">Contact Us</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <button
                  className="px-6 py-2 text-blue-600 bg-white rounded-lg border border-blue-600 hover:bg-blue-50 transition"
                  onClick={() => Navigate('/login')}
                >
                  Log In
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
                  onClick={() => Navigate('/login')}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
