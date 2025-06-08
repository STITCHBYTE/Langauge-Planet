import * as React from "react";
import { NewsletterSignup } from "./NewsletterSignup.tsx";

export function Footer() {
  return (
    <footer className=" w-full bg-blue-600">
      <div className="flex relative flex-col pt-24 w-full min-h-[721px] max-md:pt-24 max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/dcee0c7c6c2bb3c0db9cbe56f88cf900b4966f48?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 size-full"
        />
        <div className="relative z-10 self-center w-full max-w-[1292px] max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:">
            <div className="w-[58%] max-md:ml-0 max-md:w-full">
              <div className="flex relative flex-col w-full max-md:mr-0 max-md:max-w-full">
                <NewsletterSignup />
                <div className="flex gap-10 items-start self-start mt-12 max-md:mt-10 max-md:max-w-full">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight leading-tight text-white">
                      Quick Links
                    </h3>
                    <nav className="mt-3 text-base leading-none text-neutral-100">
                      <a href="#" className="block">Terms & Condition</a>
                      <a href="#" className="block mt-2">Privacy Policy</a>
                    </nav>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight leading-tight text-white">
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
            </div>
            <div className="ml-5 w-[42%] max-md:ml-0 max-md:w-full">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/184b8eae82b6ab55a09c703d12bfecb35ec4e613?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                className="object-contain grow w-full aspect-[1.22] max-md:max-w-full"
              />
            </div>
          </div>
        </div>
        <div className="relative mt-0 font-medium leading-tight text-center text-sky-200 opacity-15 text-[200px] max-md:max-w-full max-md:text-4xl">
          Language Planet
        </div>
      </div>
    </footer>
  );
}
