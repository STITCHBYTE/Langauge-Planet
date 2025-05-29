import React from 'react';
import LessonCard from './lesson.tsx'; // Adjust the import path as per your structure
import './Learning.css'; 

const LESSONS_DATA = [
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
   progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Food",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
    // progress: 50,
    timeLeft: "15 minutes left"
  },
  {
    title: "Travel Vocabulary",
    description:
      "Learn how to express travel plans, navigate transit, and book hotels in Spanish. Improve your real-world fluency.",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/1c07ecbfac49c6c12d59ef11d837c5d20a9917c5?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
    isCompleted: true
  },
  {
    title: "Shopping Phrases",
    description:
      "Master shopping-related conversations and learn to confidently ask prices, sizes, and more in Spanish.",
   icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
    progress: 30,
    timeLeft: "5 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
   progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
//    progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
   progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
//    progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
   progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
//    progress: 75,
    timeLeft: "7 minutes left"
  },
  {
    title: "Basic Spanish",
    description:
      "Lorem ipsum dolor sit amet consectetur. Et eu venenatis vel egestas scelerisque vehicula. Quis et scelerisque purus...",
    icon:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/c151759922cef12966614a9426cb1233984f82db?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775",
   progress: 75,
    timeLeft: "7 minutes left"
  }
];

const LessonGrid = () => {
  return (
    <section style={{ padding: '40px 20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {LESSONS_DATA.map((lesson, index) => (
          <LessonCard
            // key={index}
            title={lesson.title}
            description={lesson.description}
            icon={lesson.icon}
            progress={lesson.progress}
            timeLeft={lesson.timeLeft}
            isCompleted={lesson.isCompleted}
          />
        ))}
      </div>
    </section>
  );
};

export default LessonGrid;
