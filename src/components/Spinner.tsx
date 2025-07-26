import { motion, type MotionNodeOptions } from "framer-motion";
import type { HTMLAttributes } from "react";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> &
  MotionNodeOptions & {
    scale?: number;
  };

export default function Spinner({
  scale = 1,
  style,
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <motion.div
      layout="position"
      style={{
        ...style,
        width: `${0.25 * scale}rem`,
        height: `${0.25 * scale}rem`,
      }}
      className={`relative ${className}`}
      {...props}
    >
      <motion.div
        animate={{
          rotate: 360,
          transition: { ease: "linear", duration: 1, repeat: Infinity },
        }}
        className="w-full h-full"
      >
        <div
          className="w-full h-full rounded-full border-b-2 border-b-blue-500"
          style={{ transform: "translateY(1px)" }}
        ></div>
      </motion.div>
    </motion.div>
  );
}
