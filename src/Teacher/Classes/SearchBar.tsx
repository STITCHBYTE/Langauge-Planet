import * as React from "react";

export const SearchBar: React.FC = () => {
  return (
    <div className="flex flex-col justify-center text-sm min-h-12 min-w-60 text-slate-500 w-[291px]">
      <div className="w-full min-h-12">
        <div className="flex-1 w-full">
          <div className="flex-1 w-full">
            <div className="flex flex-1 gap-3 items-center px-3 py-2 rounded-xl border border-solid shadow-md border-[color:var(--Gray-300,#B3BAC6)] size-full">
              <div className="flex flex-1 shrink gap-2 items-center self-stretch my-auto w-full basis-0 min-w-60">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/d4e8b55b79550fcbb4b447fed42b078bb021108b?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                  className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                  alt="Search icon"
                />
                <span className="gap-0.5 self-stretch my-auto text-slate-500">
                  Search here...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
