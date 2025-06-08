import * as React from "react";

export function TeacherBenefits() {
  const perks = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b7ee56dc46f8a5dab9ee5828ab5ad1326903399a?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      title: "Comprehensive Dashboard",
      description: "Get an overview of your students, classes, and learning progress at a glance."
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/10d7a043b84c83d5b4f32409de945fcf953902b8?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      title: "Custom Classes & Lessons",
      description: "Create custom classes and lessons for your students in just a few clicks."
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/583fc68604dbf837983a846ad153d63c042d1a05?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      title: "Assignments & Quizzes",
      description: "Create and assign custom quizzes and assignments that suit your student needs."
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7d218d5814affeed4babe68e617249d5470ad392?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d",
      title: "Student Management",
      description: "Add and remove students from your list at will, monitor their progress & track achievements."
    }
  ];

  return (
    <section className="overflow-hidden w-full bg-stone-50">
      <div className="flex overflow-hidden relative flex-col px-20 pt-24 w-full min-h-[982px] max-md:px-5 max-md:pt-24 max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/9bd598ba969de7ee1e1c90d890625e5626974b98?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 size-full"
        />
        <div className="flex relative flex-col max-md:max-w-full">
          <header className="flex flex-col items-center self-center font-medium text-center max-md:max-w-full">
            <div className="flex flex-col justify-center items-center px-3 py-1 text-base leading-none text-blue-600 bg-blue-100 rounded-xl border border-solid border-[color:var(--Primary-600,#0D74FA)]">
              <span className="gap-1 self-stretch">
                Teacher Benefits
              </span>
            </div>
            <h2 className="mt-3 text-6xl font-semibold leading-tight text-blue-900 max-md:max-w-full max-md:text-4xl">
              Perks of being a{" "}
              <span style={{color: "rgba(13,116,250,1)"}}>
                Language Planet
              </span>{" "}
              teacher
            </h2>
            <p className="mt-3 text-xl tracking-tight leading-8 text-slate-600 max-md:max-w-full">
              Lorem ipsum dolor sit amet consectetur. Est urna sit rhoncus
              mauris ipsum. Ornare lectus commodo euismod elit elit aliquet
              dictumst varius ut. Et eget euismod blandit.
            </p>
          </header>
          <div className="mt-9 max-md:max-w-full">
            <div className="flex gap-5 max-md:flex-col max-md:">
              <div className="w-[56%] max-md:ml-0 max-md:w-full">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/1f81dd040ee49095677ce252d82d1eb4c821587b?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                  className="object-contain grow w-full aspect-square max-md:mt-10 max-md:max-w-full"
                />
              </div>
              <div className="ml-5 w-[44%] max-md:ml-0 max-md:w-full">
                <div className="self-stretch my-auto max-md:mt-10 max-md:max-w-full">
                  {perks.map((perk, index) => (
                    <article key={index} className={`flex flex-wrap gap-3 items-center ${index > 0 ? 'mt-8' : ''} max-md:max-w-full`}>
                      <img
                        src={perk.icon}
                        className="object-contain shrink-0 self-stretch my-auto aspect-square w-[85px]"
                      />
                      <div className="self-stretch my-auto min-w-60 w-[419px]">
                        <h3 className="text-2xl font-semibold tracking-tight leading-tight text-blue-950">
                          {perk.title}
                        </h3>
                        <p className="mt-2 text-xl font-medium tracking-tight leading-6 text-slate-500">
                          {perk.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
