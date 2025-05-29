"use client";
import * as React from "react";
import SearchBar from "./SearchBar.tsx";
import FilterStatus from "./FilterStatus.tsx";
import LessonCard from "./clsaaCard.tsx";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
function Lessons() {
  return (
    <div>
        <Sidebar/>
    <section style={{ padding: "1.50rem" , marginLeft:"17%"}}>
     
        <Header />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between", alignItems: "flex-end", width: "100%"}}>
        <div style={{ paddingTop: "16px", fontSize: "14px", minWidth: "240px", color: "#64748B", width: "330px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", maxWidth: "100%", minHeight: "48px", width: "330px" }}>
            <SearchBar />
          </div>
        </div>
        <FilterStatus />
      </div>

      <main style={{ marginTop: "16px", width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/a20c40a550ac573a1a7eef09b286a59ccf98e8a2?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/dd67f6684cf9b20459da76c3b0ed19da63d41bf0?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/78e55b3a1644eb4a5df84ada4e201496061b5a02?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="outline"
            buttonLabel="Go To Class"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/d33da613451123a0ed23a9bfdc1a9ef8d4e5a9a7?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/c4eb2f20ff5d49c2a6ffb16caa866651f64a0a47?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/d6b44dd9ac676af41265a091325fb8de99c17a2d?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="outline"
            buttonLabel="Go To Class"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/e21cbb1045f16802da6bd0e99cb46c55f981d5fb?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/8412d306321ca0f8eab7ba2c0783dc0785f977b7?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/787a4f6d754557971ca3e1857e6194983356269d?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="outline"
            buttonLabel="Go To Class"
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start", marginTop: "16px" }}>
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/a20c40a550ac573a1a7eef09b286a59ccf98e8a2?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/dd67f6684cf9b20459da76c3b0ed19da63d41bf0?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/78e55b3a1644eb4a5df84ada4e201496061b5a02?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="gray"
            buttonLabel="Withdraw Request"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/d33da613451123a0ed23a9bfdc1a9ef8d4e5a9a7?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/c4eb2f20ff5d49c2a6ffb16caa866651f64a0a47?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/d6b44dd9ac676af41265a091325fb8de99c17a2d?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="blue"
            buttonLabel="Request to Join"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/e21cbb1045f16802da6bd0e99cb46c55f981d5fb?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/8412d306321ca0f8eab7ba2c0783dc0785f977b7?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/787a4f6d754557971ca3e1857e6194983356269d?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="blue"
            buttonLabel="Request to Join"
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start", marginTop: "16px" }}>
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/4a3ceafdc1ce05dd19dc62c27ae7c4ab178afffa?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/dd67f6684cf9b20459da76c3b0ed19da63d41bf0?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/adfeecc6bae9185b6ba82f69e937ef416e835ea4?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="blue"
            buttonLabel="Request to Join"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/c79766454433225308ac2b2f7d40532bf3fbfc7b?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/e6553f8c81d19cae79ee0f8b0c7b361503c2908a?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/e7846a8762c18d60e271d3eef94f72eeb1f0d425?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="blue"
            buttonLabel="Request to Join"
          />
          <LessonCard
            imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/794fcc43c6c85846860254d0f65dee2cfabc1641?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/2aa5768c7edd0ca4783eed1c4847bdc05361c5ad?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/743d542e23c351bad63f1dce7470c264a2fd6c90?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
            buttonVariant="blue"
            buttonLabel="Request to Join"
          />
        </div>
      </main>
    </section>
    </div>
  );
}

export default Lessons;
