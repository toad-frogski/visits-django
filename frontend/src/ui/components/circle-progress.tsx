import { type FC } from "react";
import { tv } from "tailwind-variants";

export type CircleProgressProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: "accent" | "green" | "red";
  className?: string;
};

const circleProgress = tv({
  variants: {
    color: {
      accent: "stroke-accent",
      red: "stroke-red",
      green: "stroke-green",
    },
  },
  defaultVariants: {
    color: "accent",
  },
});

const CircleProgress: FC<CircleProgressProps> = ({
  size = 24,
  strokeWidth = 3,
  progress,
  color,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (validProgress / 100) * circumference;

  return (
    <svg width={size} height={size} className={className}>
      <circle
        className={"stroke-background"}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={circleProgress({ color: color })}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

export default CircleProgress;
