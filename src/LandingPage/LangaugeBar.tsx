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
    <section className="flex overflow-hidden relative flex-col justify-center px-28 py-7 mt-20 w-full bg-blue-100 border-t border-b border-solid border-b-[color:var(--Gray-200,#D7DAE0)] border-t-[color:var(--Gray-200,#D7DAE0)] min-h-[113px] max-md:px-5 max-md:mt-10 max-md:max-w-full">
      <div className="flex flex-wrap flex-1 gap-10 justify-between items-center size-full max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a789f34e1ddc447cc4a0200b81f52e1729a0a00a?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-contain shrink-0 self-stretch my-auto w-10 aspect-square"
        />
        <div className="flex flex-wrap gap-8 items-center self-stretch my-auto min-w-60 max-md:max-w-full">
          {languages.map((language, index) => (
            <div key={index} className="flex gap-3 items-center self-stretch my-auto">
              <div className="flex gap-4 items-center self-stretch my-auto w-12">
                {language.customFlag ? (
                  language.name === "French" ? (
                    <div className="overflow-hidden self-stretch my-auto w-12 rounded-[75px]">
                      <div className="flex gap-4 w-12 h-12 bg-white">
                        <div className="flex shrink-0 w-4 h-12 bg-violet-950" />
                        <div className="flex shrink-0 h-12 bg-red-600 w-[17px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden self-stretch my-auto w-12 h-12 rounded-[75px]">
                      <div className="flex shrink-0 h-4 bg-black" />
                      <div className="flex shrink-0 bg-red-600 h-[15px]" />
                      <div className="flex shrink-0 bg-yellow-400 h-[17px]" />
                    </div>
                  )
                ) : (
                  <img
                    src={language.flag}
                    className="object-contain self-stretch my-auto w-12 aspect-square rounded-[75px]"
                  />
                )}
              </div>
              <span className="gap-2 self-stretch my-auto text-3xl font-medium leading-none text-gray-600 whitespace-nowrap rounded-lg">
                {language.name}
              </span>
            </div>
          ))}
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/83334188f73cef65f563ce939a38ccb068d63d75?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-contain shrink-0 self-stretch my-auto w-10 aspect-square"
        />
      </div>
    </section>
  );
}
