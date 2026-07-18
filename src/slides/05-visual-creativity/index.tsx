import { motion } from "motion/react";
import type { Variants } from "motion/react";
import visual01Url from "./visual-01.webp";
import visual02Url from "./visual-02.webp";
import visual03Url from "./visual-03.webp";
import visual04Url from "./visual-04.webp";
import visual05Url from "./visual-05.webp";
import visual06Url from "./visual-06.webp";
import moodboardUrl from "../29-shorten-the-loop/moodboard.webp";

type VisualCreativitySlideProps = {
  className?: string;
  isAnimated?: boolean;
};

type VisualCreativityImage = {
  height: number;
  src: string;
  width: number;
  x: number;
  y: number;
};

const artboardWidth = 3640;
const artboardHeight = 1912;

const visualCreativityImages: VisualCreativityImage[] = [
  { src: visual01Url, x: 0, y: 0, width: 1170, height: 799 },
  { src: visual02Url, x: 1210, y: 0, width: 1466, height: 974 },
  { src: visual03Url, x: 2716, y: 0, width: 924, height: 1912 },
  { src: visual04Url, x: 0, y: 839, width: 1170, height: 1073 },
  { src: visual05Url, x: 1210, y: 1014, width: 791, height: 898 },
  { src: visual06Url, x: 2041, y: 1014, width: 635, height: 898 },
];

export function VisualCreativitySlide({
  className = "",
  isAnimated = false,
}: VisualCreativitySlideProps) {
  return (
    <div className={`visual-creativity-slide ${className}`.trim()}>
      {visualCreativityImages.map((image, index) => (
        <motion.img
          alt=""
          animate="show"
          aria-hidden="true"
          className="visual-creativity-slide__image"
          custom={index}
          draggable={false}
          initial={isAnimated ? "hidden" : false}
          key={image.src}
          src={image.src}
          style={{
            height: `${(image.height / artboardHeight) * 100}%`,
            left: `${(image.x / artboardWidth) * 100}%`,
            top: `${(image.y / artboardHeight) * 100}%`,
            width: `${(image.width / artboardWidth) * 100}%`,
          }}
          variants={imageVariants}
        />
      ))}
    </div>
  );
}

export function VisualCreativityCollageSlide({
  className = "",
}: Pick<VisualCreativitySlideProps, "className">) {
  return (
    <div className={`visual-creativity-collage-slide ${className}`.trim()}>
      <img
        alt=""
        aria-hidden="true"
        className="visual-creativity-collage-slide__image"
        draggable={false}
        src={moodboardUrl}
      />
    </div>
  );
}

const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: "7%",
  },
  show: (index: number) => ({
    opacity: 1,
    y: "0%",
    transition: {
      delay: index * 0.11,
      duration: 0.44,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};
