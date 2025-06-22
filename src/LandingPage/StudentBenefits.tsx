import * as React from "react";
import { BenefitCard } from "./BenefitCard.tsx";

export function StudentBenefits() {
  const benefits = [
    {
      title: "Diverse Languages",
      description: "Learn from a wide range of languages, including English, Spanish, French, and more!",
      bgColor: "bg-pink-50",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/0a81cee4137db5099582dc9ce5b6af5bae125183?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "overlay"
    },
    {
      title: "Interactive Lessons",
      description: "Dive into interactive lessons tailored for your learning needs.",
      bgColor: "bg-stone-200",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/ee9545281ec125c13d9c3201d8ada81f10f1f32f?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "centered"
    },
    {
      title: "Fun Games",
      description: "Sharpen your language skills while having fun with our educational games.",
      bgColor: "bg-amber-100",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9b0a3e50121e1f7efaca5d38bf03a0bc4d18456b?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "wide"
    },
    {
      title: "Learn with Friends",
      description: "Build a community of language learners and challenge each other to grow together.",
      bgColor: "bg-orange-100",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/f10240a3f52e70a8a5ca57e79d70032f9888b907?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "portrait"
    },
    {
      title: "Chrome Extension",
      description: "Take your learning to the next level with our Chrome extension, offering website word translation, whitelisting, and more!",
      bgColor: "bg-stone-200",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/25a4a6922b26add7abc2ee6393d034d4662e8878?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "centered"
    },
    {
      title: "Track Progress",
      description: "Monitor your learning journey and celebrate your achievements.",
      bgColor: "bg-stone-300",
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/091eeef6838382ce1e1c37da20cab4a00c0f8dd3?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      imageType: "centered"
    }
  ];

  return (
    <section className="flex flex-col py-16 px-4 sm:px-8 md:px-16 w-full bg-green-50">
      <header className="flex flex-col items-center self-center max-w-full font-medium text-center w-full md:w-[802px]">
        <div className="flex flex-col justify-center items-center px-3 py-1 text-base leading-none text-blue-600 bg-blue-100 rounded-xl border border-solid border-blue-600">
          <span className="gap-1 self-stretch text-blue-600">
            Student Benefits
          </span>
        </div>
        <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight text-blue-900">
          What we have for you
        </h2>
        <p className="self-stretch mt-3 text-base sm:text-lg md:text-xl tracking-tight leading-7 md:leading-8 text-slate-600">
          Lorem ipsum dolor sit amet consectetur. Est urna sit rhoncus
          mauris ipsum. Ornare lectus commodo euismod elit elit aliquet
          dictumst varius ut. Et eget euismod blandit.
        </p>
      </header>
      {/* Responsive grid for cards */}
      <div className="mt-12 grid grid-flow-col auto-cols-[80%] sm:auto-cols-[45%] md:auto-cols-[30%] gap-6 sm:gap-8 md:gap-4 overflow-x-auto pb-4 md:grid-flow-row md:grid-cols-3 md:auto-cols-auto md:overflow-x-visible">
        {benefits.map((benefit, index) => (
          <BenefitCard key={index} {...benefit} />
        ))}
      </div>
    </section>
  );
}
