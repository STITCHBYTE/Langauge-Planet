import * as React from "react";

interface BenefitCardProps {
  title: string;
  description: string;
  bgColor: string;
  image: string;
  imageType: "overlay" | "centered" | "wide" | "portrait";
}

export function BenefitCard({ title, description, bgColor, image, imageType }: BenefitCardProps) {
  const renderImage = () => {
    switch (imageType) {
      case "overlay":
        return (
          <div className={`flex flex-col items-center mt-5 mr-9 ml-9 text-xs text-white whitespace-nowrap ${bgColor} aspect-square max-md:mx-2.5`}>
            <div className="flex relative flex-col gap-5 justify-between items-start pl-[17.75rem] pr-[1.75rem] pt-10 pb-60 w-full aspect-square max-md:px-5 max-md:pb-24">
              <img
                src={image}
                className="object-cover absolute inset-0 w-[70%] h-[70%]"
              />
              <div className="relative">Hello!</div>
              <div className="relative">Hola</div>
            </div>
          </div>
        );
      case "centered":
        return (
          <div className={`flex z-10 flex-col justify-center items-center px-11 mt-4 aspect-square ${bgColor} max-md:px-5`}>
            <img
              src={image}
              className="object-contain w-full aspect-square"
            />
          </div>
        );
      case "wide":
        return (
          <div className={`flex z-10 flex-col justify-center px-9 py-14 mt-5 ${bgColor} fill-amber-100 max-md:px-5 max-md:mr-0 max-md:max-w-full`}>
            <img
              src={image}
              className="object-contain w-full aspect-[1.47]"
            />
          </div>
        );
      case "portrait":
        return (
          <img
            src={image}
            className="object-contain self-center mt-0 max-w-full aspect-[0.8] w-[278px]"
          />
        );
      default:
        return null;
    }
  };

  return (
    <article className={`overflow-hidden px-6 pt-6 ${bgColor} rounded-2xl min-w-[25rem] w-[420px] max-md:px-5 max-h-[500px]`}>
      <div className={imageType === "portrait" ? "z-10" : ""}>
        <h3 className="text-4xl font-bold tracking-tighter text-stone-800">
          {title}
        </h3>
        <p className="mt-1 text-2xl font-medium tracking-tight leading-9 text-neutral-600">
          {description}
        </p>
      </div>
      {renderImage()}
    </article>
  );
}
