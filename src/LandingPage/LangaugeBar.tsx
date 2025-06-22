import * as React from "react";

export function LanguageBar() {
  const languages = [
    { name: "Spanish", flag: "https://cdn.builder.io/api/v1/image/assets/TEMP/6ca38189fb0788f75795c91ea4c83bc0724a01b7?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d" },
    { name: "English", flag: "https://cdn.builder.io/api/v1/image/assets/TEMP/191ef40119c3f521b245cf60b6b68a1a8ed413e1?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d" },
    { name: "French", flag: undefined, customFlag: true },
    { name: "Japanese", flag: "https://cdn.builder.io/api/v1/image/assets/TEMP/6200afc5b775b3174c0ef73fdbbc4af61b9f55a5?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d" },
    { name: "German", flag: undefined, customFlag: true }
  ];

  return (
    <section className="flex overflow-x-auto relative flex-col justify-center px-4 sm:px-10 md:px-20 lg:px-28 py-7 mt-10 sm:mt-16 w-full bg-blue-100 border-t border-b border-solid border-b-[color:var(--Gray-200,#D7DAE0)] border-t-[color:var(--Gray-200,#D7DAE0)] min-h-[90px]">
      <div className="flex flex-nowrap sm:flex-wrap gap-6 sm:gap-10 justify-between items-center w-full min-w-[340px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a789f34e1ddc447cc4a0200b81f52e1729a0a00a?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-contain shrink-0 w-8 sm:w-10 aspect-square"
          alt="Left Icon"
        />
        <div className="flex flex-nowrap sm:flex-wrap gap-4 sm:gap-8 items-center">
          {languages.map((language, index) => (
            <div key={index} className="flex gap-2 sm:gap-3 items-center">
              <div className="flex items-center w-9 sm:w-12">
                {language.customFlag ? (
                  language.name === "French" ? (
                    <div className="overflow-hidden w-9 sm:w-12 rounded-full">
                      <div className="flex w-9 sm:w-12 h-9 sm:h-12 bg-white">
                        <div className="w-1/3 h-full bg-violet-950" />
                        <div className="w-1/3 h-full bg-white" />
                        <div className="w-1/3 h-full bg-red-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden w-9 sm:w-12 h-9 sm:h-12 rounded-full flex flex-col">
                      <div className="h-1/3 w-full bg-black" />
                      <div className="h-1/3 w-full bg-red-600" />
                      <div className="h-1/3 w-full bg-yellow-400" />
                    </div>
                  )
                ) : (
                  <img
                    src={language.flag}
                    className="object-contain w-9 sm:w-12 aspect-square rounded-full"
                    alt={language.name + " flag"}
                  />
                )}
              </div>
              <span className="text-lg sm:text-2xl md:text-3xl font-medium text-gray-600 whitespace-nowrap rounded-lg">
                {language.name}
              </span>
            </div>
          ))}
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/83334188f73cef65f563ce939a38ccb068d63d75?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-contain shrink-0 w-8 sm:w-10 aspect-square"
          alt="Right Icon"
        />
      </div>
    </section>
  );
}
