import * as React from "react";

interface ClassBadgeProps {
  type: "private" | "public";
}

export const ClassBadge: React.FC<ClassBadgeProps> = ({ type }) => {
  const isPrivate = type === "private";
  const bgColor = isPrivate ? "bg-amber-100" : "bg-green-100";
  const textColor = isPrivate ? "text-amber-800" : "text-green-800";

  return (
    <div className={`flex flex-col justify-center items-center self-stretch px-3 py-0.5 my-auto ${bgColor} rounded-xl`}>
      <span className={`gap-0.5 self-stretch ${textColor}`}>
        {isPrivate ? "Private Class" : "Public Class"}
      </span>
    </div>
  );
};
