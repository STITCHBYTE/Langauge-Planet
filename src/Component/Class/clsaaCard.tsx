import React from "react";
import LessonCardButton from "./classCardButton.tsx";

function useResponsiveWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width <= 600 ? "330px" : "371px";
}

function LessonCard({
  imageUrl,
  instructorImage,
  studentsImage,
  buttons,
  title,
  description,
  instructorName,
  studentCount,
}) {
  const responsiveWidth = useResponsiveWidth();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px 20px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #EDEEF1",
    minWidth: "240px",
    width: responsiveWidth,
    boxSizing: "border-box",
  };

  const imageWrapperStyle = {
    display: "flex",
    gap: "40px",
    alignItems: "center",
    width: "100%",
  };

  const lessonImageStyle = {
    width: "56px",
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
    fontSize: "1.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: 1.25,
    color: "#27272A",
    margin: 0,
  };

  const descriptionStyle = {
    marginTop: "6px",
    fontSize: "0.75rem",
    lineHeight: 1.25,
    color: "#6B7280",
  };

  const infoContainerStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "16px",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1,
    color: "#6B7280",
  };

  const infoItemStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    margin: "auto 0",
  };

  const avatarStyle = {
    width: "24px",
    aspectRatio: "1 / 1",
    objectFit: "contain",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  };

  return (
    <article style={containerStyle}>
      <div>
        <div style={{ width: "100%" }}>
          <div style={imageWrapperStyle}>
            <img src={imageUrl} alt="Lesson icon" style={lessonImageStyle} />
          </div>
        </div>

        <div style={contentWrapperStyle}>
          <div style={textContainerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <p style={descriptionStyle}>{description}</p>
          </div>
        </div>

        <div style={infoContainerStyle}>
          <div style={infoItemStyle}>
            <img
              src={instructorImage}
              alt="Instructor avatar"
              style={avatarStyle}
            />
            <span>{instructorName} •</span>
          </div>
          <div style={infoItemStyle}>
            <img src={studentsImage} alt="Students icon" style={avatarStyle} />
            <span>{studentCount} Students</span>
          </div>
        </div>
      </div>

      <div style={buttonContainerStyle}>
        {buttons &&
          buttons.map((button, index) => (
            <LessonCardButton
              key={index}
              variant={button.variant}
              label={button.label}
              onClick={button.onClick}
            />
          ))}
      </div>
    </article>
  );
}

export default LessonCard;
