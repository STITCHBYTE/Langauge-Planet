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
    <div className="bg-white min-h-screen w-full">
      <main className="bg-sky-50 w-full">
        <div className="relative flex flex-col w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-[90vh]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/36665ec2bddea62f1e97bc050db1f54ddcfaf582?placeholderIfAbsent=true&apiKey=b25fbc87d9254d4c96237d8f2fb90e0d"
            className="object-cover absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
            alt="Landing background"
          />
          <div className="relative z-10 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Navigation />
            <HeroSection />
            <LanguageBar />
          </div>
        </div>
      </main>
      <section className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <StudentBenefits />
      </section>
      <section className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <TeacherBenefits />
      </section>
      <section className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <FAQSection />
      </section>
      <Footer />
    </div>
  );
}
