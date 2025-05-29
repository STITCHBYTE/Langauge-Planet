import React from "react";
import LessonCardButton from "./classCardButton.tsx";

function LessonCard({
  imageUrl,
  instructorImage,
  studentsImage,
  buttonVariant,
  buttonLabel,
}) {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    padding: "24px 20px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #EDEEF1",
    minWidth: "240px",
    width: "371px",
    boxSizing: "border-box",
  };

  const imageWrapperStyle = {
    display: "flex",
    gap: "40px",
    alignItems: "center",
    width: "100%",
  };

  const lessonImageStyle = {
    width: "56px", // roughly w-14
    aspectRatio: "0.93",
    objectFit: "contain",
    alignSelf: "stretch",
    margin: "auto 0",
  };

  const contentWrapperStyle = {
    display: "flex",
    alignItems: "flex-end",
    marginTop: "20px",
    width: "100%",
  };

  const textContainerStyle = {
    flex: "1 1 0",
    minWidth: "240px",
  };

  const titleStyle = {
    fontSize: "1.25rem", // text-xl
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.25,
    color: "#27272A", // zinc-800
    margin: 0,
  };

  const descriptionStyle = {
    marginTop: "6px",
    fontSize: "0.75rem", // text-xs
    lineHeight: 1.25,
    color: "#6B7280", // slate-500
  };

  const infoContainerStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "16px",
    fontSize: "0.875rem", // text-sm
    fontWeight: 500,
    lineHeight: 1,
    color: "#6B7280", // slate-500
  };

  const infoItemStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    margin: "auto 0",
  };

  const avatarStyle = {
    width: "24px", // w-6
    aspectRatio: "1 / 1",
    objectFit: "contain",
  };

  return (
    <article style={containerStyle}>
      <div style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          <div style={imageWrapperStyle}>
            <img
              src={imageUrl}
              alt="Lesson icon"
              style={lessonImageStyle}
            />
          </div>
        </div>

        <div style={contentWrapperStyle}>
          <div style={textContainerStyle}>
            <h2 style={titleStyle}>Basic Spanish Culture</h2>
            <p style={descriptionStyle}>
              Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula.
            </p>
          </div>
        </div>
      </div>

      <div style={infoContainerStyle}>
        <div style={infoItemStyle}>
          <img
            src={instructorImage}
            alt="Instructor avatar"
            style={avatarStyle}
          />
          <span>Carlos Juan •</span>
        </div>
        <div style={infoItemStyle}>
          <img
            src={studentsImage}
            alt="Students icon"
            style={avatarStyle}
          />
          <span>20 Students</span>
        </div>
      </div>

      <LessonCardButton variant={buttonVariant} label={buttonLabel} />
    </article>
  );
}

export default LessonCard;
