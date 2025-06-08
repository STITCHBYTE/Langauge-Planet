"use client";
import * as React from "react";

interface FAQItemProps {
  question: string;
}

export function FAQItem({ question }: FAQItemProps) {
  return (
    <article className="flex overflow-hidden flex-col justify-center px-6 pt-6 pb-10 w-full bg-white rounded-xl border border-solid border-[color:var(--Gray-300,#B3BAC6)] max-md:px-5 max-md:max-w-full">
      <div className="flex flex-wrap gap-3 items-center w-full max-md:max-w-full">
        <div className="flex flex-wrap flex-1 shrink gap-4 items-center self-stretch my-auto text-lg font-medium leading-none basis-0 min-w-60 text-zinc-800 max-md:max-w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1af65b73fe2dbda6d205e1b46825fcda060f29dd?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
          <div className="flex-1 shrink gap-0.5 self-stretch my-auto basis-0 min-w-60 max-md:max-w-full">
            {question}
          </div>
        </div>
        <div className="flex gap-1 items-center self-stretch my-auto w-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/92139894b72aa57b64aa619b2af14ee8e45bf258?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
      </div>
    </article>
  );
}
