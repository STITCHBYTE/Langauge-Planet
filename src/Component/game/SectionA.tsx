"use client";

import * as React from "react";
import GameCard from "./GameCard.tsx";
import "./GameCard.css"; // Import styles

const SectionA: React.FC = () => {
  return (
    <section className="section-a">
      <GameCard
        backgroundClass="bg-blue"
        coverImage="https://cdn.builder.io/api/v1/image/assets/TEMP/1bf32348527794d1efa089cc8ab15e204fdcad56?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
        overlayImage="https://cdn.builder.io/api/v1/image/assets/TEMP/620c4404ba32be14d604579e55c1a6f129050c79?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
        title="Word Racing Game"
        description="Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
      />
      <div className="section-a__spacer">
        <GameCard
          backgroundClass="bg-emerald"
          coverImage="https://cdn.builder.io/api/v1/image/assets/TEMP/fc61acc0eef22ec08fc7048e67207c044594a229?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
          overlayImage="https://cdn.builder.io/api/v1/image/assets/TEMP/0fac39aa374587add36623d9f96c01305d023183?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
          title="Word Fight Game"
          description="Lorem ipsum dolor sit amet consectetur. Cursus diam nisi sit lacinia diam integer urna proin malesuada."
        />
      </div>
    </section>
  );
};

export default SectionA;
