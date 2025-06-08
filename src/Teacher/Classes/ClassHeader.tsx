import * as React from "react";
import { SearchBar } from "./SearchBar.tsx";

export const LessonsHeader: React.FC = () => {
  return (
    <header className="flex flex-wrap gap-10 justify-between items-end px-6 w-full leading-none max-md:px-5 max-md:max-w-full">
      <div className="pt-4 min-w-60 max-md:max-w-full">
        <div className="flex gap-2 items-start min-h-12 max-md:max-w-full">
          <SearchBar />
          <button className="flex gap-2 justify-center items-center px-5 py-3 text-base font-medium text-blue-600 bg-white rounded-lg border border-solid border-[color:var(--Primary-600,#0D74FA)]">
            <span className="self-stretch my-auto text-blue-600">Filter By</span>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b5aec9036fe09c004155fcd69f060098c8eaed66?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
              className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
              alt="Filter icon"
            />
          </button>
        </div>
      </div>
      <button className="flex gap-2 justify-center items-center px-5 py-3 text-base font-medium bg-blue-600 rounded-lg text-neutral-100">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/53e1dec095779b21203584b18e5f9e17900b040e?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
          alt="Create icon"
        />
        <span className="self-stretch my-auto text-neutral-100">
          Create New Class
        </span>
      </button>
    </header>
  );
};
