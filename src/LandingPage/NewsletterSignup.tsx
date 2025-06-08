"use client";
import * as React from "react";

export function NewsletterSignup() {
  return (
    <div className="max-md:max-w-full">
      <h2 className="max-w-full text-4xl font-semibold tracking-tighter leading-10 text-white w-[750px] max-md:max-w-full">
        Get notified whenever <br />
        we release a new language
      </h2>
      <form className="flex overflow-hidden flex-col justify-center px-6 py-4 mt-8 max-w-full font-medium leading-none bg-white rounded-xl border border-solid border-[color:var(--Gray-300,#B3BAC6)] w-[646px] max-md:px-5">
        <div className="flex flex-wrap gap-3 items-center w-full max-md:max-w-full">
          <div className="flex flex-1 shrink gap-4 items-center self-stretch my-auto text-lg text-gray-400 basis-0 min-w-60 max-md:max-w-full">
            <input
              type="email"
              placeholder="Enter email address here"
              className="flex-1 shrink gap-0.5 self-stretch my-auto w-full basis-0 min-w-60 max-md:max-w-full bg-transparent border-none outline-none"
            />
          </div>
          <div className="flex gap-1 items-center self-stretch my-auto text-base text-neutral-100">
            <button
              type="submit"
              className="gap-2 self-stretch px-6 py-4 my-auto bg-blue-600 rounded-lg max-md:px-5"
            >
              Get Notified
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
