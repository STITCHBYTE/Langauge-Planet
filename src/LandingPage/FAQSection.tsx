import * as React from "react";
import { FAQItem } from "./FAQItem.tsx";
import { useNavigate } from "react-router-dom";

export function FAQSection() {
  const Navigate = useNavigate();
  const faqs = Array(8).fill({
    question: "Lorem ipsum dolor sit amet consectetur. Suspendisse lorem ac non?"
  });

  return (
    <section className="overflow-hidden w-full bg-sky-50">
      <div className="flex overflow-hidden relative flex-col justify-center px-4 sm:px-8 md:px-20 py-12 sm:py-16 md:py-20 w-full min-h-[600px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3a06ea84dad6467d8aee6c45d8e435c600e50a7c?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 w-full h-full"
          alt="FAQ background"
        />
        <div className="flex relative flex-col items-center w-full">
          <header className="flex flex-col max-w-2xl text-center w-full">
            <h2 className="self-center text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight text-blue-900">
              Questions we are often asked
            </h2>
            <p className="mt-3 text-base sm:text-lg md:text-xl font-medium tracking-tight text-slate-600">
              Have some questions? We may have answered them below
            </p>
          </header>
          <div className="mt-10 sm:mt-14 w-full max-w-2xl">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} />
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center self-stretch px-4 sm:px-8 md:px-16 py-8 sm:py-12 mt-16 sm:mt-24 w-full bg-blue-600 rounded-2xl md:rounded-[32px]">
            <div className="flex-1 text-center md:text-left text-lg sm:text-xl md:text-2xl leading-8 text-white min-w-0">
              Ready to have a fun <br />
              language learning experience?
            </div>
            <div className="flex flex-row gap-4 w-full md:w-auto justify-center md:justify-end">
              <button
                className="px-6 py-4 text-blue-600 bg-white rounded-lg border border-solid border-blue-600 font-medium"
                onClick={() => Navigate('/login')}
              >
                Get Started for Free
              </button>
              <button
                className="px-6 py-4 bg-blue-600 rounded-lg border border-solid border-white text-neutral-100 font-medium"
                onClick={() => Navigate('/login')}
              >
                Log In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
