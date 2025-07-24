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
    <section className="overflow-hidden w-full bg-stone-50 py-16 px-4 sm:px-8 md:px-20">
      <div className="relative flex flex-col w-full max-w-7xl mx-auto">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/9bd598ba969de7ee1e1c90d890625e5626974b98?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
          className="object-cover absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          alt="Background"
        />
        <div className="relative flex flex-col w-full">
          <header className="flex flex-col items-center font-medium text-center w-full max-w-3xl mx-auto">
            <div className="flex flex-col justify-center items-center px-3 py-1 text-base leading-none text-blue-600 bg-blue-100 rounded-xl border border-solid border-blue-600">
              <span>Teacher Benefits</span>
            </div>
            <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight text-blue-900">
              Perks of being a{" "}
              <span className="text-blue-600">
                Language Planet
              </span>{" "}
              teacher
            </h2>
            <p className="mt-3 text-base sm:text-lg md:text-xl tracking-tight leading-7 md:leading-8 text-slate-600">
              Lorem ipsum dolor sit amet consectetur. Est urna sit rhoncus
              mauris ipsum. Ornare lectus commodo euismod elit elit aliquet
              dictumst varius ut. Et eget euismod blandit.
            </p>
          </header>
          <div className="mt-12 flex flex-col md:flex-row gap-10 w-full items-center">
            <div className="w-full md:w-1/2 flex justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/1f81dd040ee49095677ce252d82d1eb4c821587b?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
                className="object-contain w-full max-w-xs sm:max-w-md md:max-w-lg aspect-square"
                alt="Teacher Illustration"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-8">
              {perks.map((perk, index) => (
                <article key={index} className="flex gap-4 items-start">
                  <img
                    src={perk.icon}
                    className="object-contain w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white shadow"
                    alt={perk.title + " icon"}
                  />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight text-blue-950">
                      {perk.title}
                    </h3>
                    <p className="mt-2 text-base sm:text-lg font-medium tracking-tight leading-6 text-slate-500">
                      {perk.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
