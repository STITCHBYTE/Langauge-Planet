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
      <div className="flex overflow-hidden relative flex-col justify-center px-20 py-20 w-full min-h-[1266px] max-md:px-5 max-md:pt-24 max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3a06ea84dad6467d8aee6c45d8e435c600e50a7c?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 size-full"
        />
        <div className="flex relative flex-col items-center max-md:max-w-full">
          <header className="flex flex-col max-w-full text-center w-[751px]">
            <h2 className="self-center text-6xl font-semibold leading-tight text-blue-900 max-md:max-w-full max-md:text-4xl">
              Questions we are often asked
            </h2>
            <p className="mt-3 text-xl font-medium tracking-tight text-slate-600 max-md:max-w-full">
              Have some questions? We may have answered them below
            </p>
          </header>
          <div className="mt-16 max-w-full w-[775px] max-md:mt-10">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} />
            ))}
          </div>
          <div className="flex overflow-hidden flex-wrap gap-10 items-center self-stretch px-16 py-12 mt-44 w-full bg-blue-600 rounded-[32px] max-md:px-5 max-md:mt-10 max-md:max-w-full">
            <div className="flex-1 shrink self-stretch my-auto text-4xl leading-10 text-white basis-0 min-w-60 max-md:max-w-full">
              Ready to have a fun <br />
              language learning experience?
            </div>
            <div className="flex gap-4 items-start self-stretch my-auto text-base font-medium leading-none min-w-60">
              <button className="gap-2 self-stretch px-6 py-4 text-blue-600 bg-white rounded-lg border border-solid border-[color:var(--Primary-600,#0D74FA)] max-md:px-5" onClick={() => Navigate('/login')}>
                Get Started for Free
              </button>
              <button className="gap-2 self-stretch px-6 py-4 bg-blue-600 rounded-lg border border-solid border-[color:var(--Shade-White,#FFF)] text-neutral-100 max-md:px-5" onClick={() => Navigate('/login')}>
                Log In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
