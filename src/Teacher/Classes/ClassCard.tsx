import * as React from "react";
import { ClassBadge } from "./Badge.tsx";

interface LessonCardProps {
  iconSrc: string;
  menuIconSrc: string;
  title: string;
  description: string;
  type: "private" | "public";
  studentsIconSrc: string;
  studentCount: number;
}

export const ClassCard: React.FC<LessonCardProps> = ({
  iconSrc,
  menuIconSrc,
  title,
  description,
  type,
  studentsIconSrc,
  studentCount,
}) => {
  return (
    <article className="flex flex-col py-6 bg-white rounded-xl border border-solid border-[color:var(--Gray-100,#EDEEF1)] min-w-60 w-[371px]">
      <div className="w-full">
        <div className="flex gap-4 items-start w-full">
          <div className="flex flex-1 shrink gap-10 items-center basis-0 min-w-60">
            <img
              src={iconSrc}
              className="object-contain self-stretch my-auto w-14 aspect-[0.93]"
              alt="Lesson icon"
            />
          </div>
          <img
            src={menuIconSrc}
            className="object-contain shrink-0 w-6 aspect-square"
            alt="Menu"
          />
        </div>
        <div className="flex items-end mt-5 w-full">
          <div className="flex-1 shrink w-full basis-0 min-w-60">
            <h2 className="text-xl font-semibold tracking-tight leading-tight text-zinc-800">
              {title}
            </h2>
            <p className="mt-1.5 text-xs leading-4 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>
      <hr className="self-center mt-6 max-w-full bg-gray-100 border border-gray-100 border-solid min-h-px w-[371px]" />
      <footer className="flex gap-2 items-center mt-6 w-full text-sm font-medium leading-none">
        <div className="flex gap-3 items-center self-stretch my-auto text-center">
          <ClassBadge type={type} />
        </div>
        <div className="flex gap-2 items-center self-stretch my-auto text-slate-500">
          <img
            src={studentsIconSrc}
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            alt="Students icon"
          />
          <span className="self-stretch my-auto text-slate-500">
            {studentCount} Students
          </span>
        </div>
      </footer>
    </article>
  );
};
