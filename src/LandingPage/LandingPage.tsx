import * as React from "react";
import { Navigation } from "./Navigation.tsx";
import { HeroSection } from "./HeroSection.tsx";
import { LanguageBar } from "./LangaugeBar.tsx";
import { StudentBenefits } from "./StudentBenefits.tsx";
import { TeacherBenefits } from "./TeacherBenefits.tsx";
import { FAQSection } from "./FAQSection.tsx";
import { Footer } from "./Footer.tsx";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="">
      <div className="w-full bg-white max-md:max-w-full">
        <main className="w-full bg-sky-50">
          <div className="flex relative flex-col w-full min-h-[982px] max-md:max-w-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/36665ec2bddea62f1e97bc050db1f54ddcfaf582?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
              className="object-cover absolute inset-0 size-full"
            />
            <Navigation />
            <HeroSection />
            <LanguageBar />
          </div>
        </main>
        <StudentBenefits />
        <TeacherBenefits />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
