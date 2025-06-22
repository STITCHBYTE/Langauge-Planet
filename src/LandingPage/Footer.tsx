import * as React from "react";
import { NewsletterSignup } from "./NewsletterSignup.tsx";

export function Footer() {
  return (
    <footer className="w-full bg-blue-600">
      <div className="flex relative flex-col pt-16 pb-8 px-4 sm:px-8 md:px-16 w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/dcee0c7c6c2bb3c0db9cbe56f88cf900b4966f48?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 w-full h-full"
          alt="Footer background"
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 md:gap-8 w-full">
            <div className="w-full md:w-3/5 flex flex-col">
              <NewsletterSignup />
              <div className="flex flex-col sm:flex-row gap-8 items-start mt-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight text-white">
                    Quick Links
                  </h3>
                  <nav className="mt-3 text-base leading-none text-neutral-100">
                    <a href="#" className="block">Terms & Condition</a>
                    <a href="#" className="block mt-2">Privacy Policy</a>
                  </nav>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight text-white">
                    Get in Touch
                  </h3>
                  <div className="mt-3 text-base leading-none underline whitespace-nowrap text-neutral-100">
                    <a href="mailto:Languageplanet@examle.com" className="block underline decoration-auto decoration-solid underline-offset-auto">
                      Languageplanet@examle.com
                    </a>
                    <a href="tel:0987654321" className="block mt-2 underline decoration-auto decoration-solid underline-offset-auto">
                      9999999999
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/5 flex justify-center items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/184b8eae82b6ab55a09c703d12bfecb35ec4e613?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                className="object-contain w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[1.22]"
                alt="Footer illustration"
              />
            </div>
          </div>
        </div>
        <div className="relative mt-8 font-medium leading-tight text-center text-sky-200 opacity-15 text-5xl sm:text-7xl md:text-9xl">
          Language Planet
        </div>
      </div>
    </footer>
  );
}
