import { type FC } from "react";

export type CircleProgressStyleProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  circleClassName?: string;
}

type CircleProgressProps = CircleProgressStyleProps & {
  progress: number;
};

const CircleProgress: FC<CircleProgressProps> = ({
  size = 24,
  strokeWidth = 3,
  progress,
  className,
  circleClassName,
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
        className={circleClassName}
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
