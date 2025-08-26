import React from "react";
import { Flex } from "antd";
import { COLORS } from "../../theme/style-constants";

interface Grade {
  label: string;
  min: number;
  color: string;
  description: string;
}

interface LivestIndexRangeProps {
  value: number;
}

const LivestIndexRange: React.FC<LivestIndexRangeProps> = ({ value }) => {
  // Define the grade labels and corresponding color stops
  const grades: Grade[] = [
    {
      label: "A+",
      min: 0.45,
      color: "#00ff00",
      description:
        "Exceptional investment potential with robust returns and low risk.",
    },
    {
      label: "A",
      min: 0.4,
      color: "#33ff00",
      description: "Strong investment with high returns and stable growth.",
    },
    {
      label: "A-",
      min: 0.35,
      color: "#66ff00",
      description:
        "Reliable investment offering solid returns with minimal risk.",
    },
    {
      label: "B+",
      min: 0.3,
      color: "#99ff00",
      description:
        "Good investment with above-average returns and stable outlook.",
    },
    {
      label: "B",
      min: 0.25,
      color: "#ccff00",
      description:
        "Moderate investment potential, with reasonable returns and growth.",
    },
    {
      label: "B-",
      min: 0.2,
      color: "#E6FF1A",
      description:
        "Decent investment, showing modest returns with manageable risk.",
    },
    {
      label: "C+",
      min: 0.16,
      color: "#FFFF33",
      description:
        "Average investment with acceptable returns and some variability in growth.",
    },
    {
      label: "C",
      min: 0.13,
      color: "#FFFF99",
      description:
        "Basic investment with potential for steady growth, though subject to fluctuations.",
    },
    {
      label: "C-",
      min: 0.1,
      color: "#FFE57F",
      description:
        "Stable option with limited growth prospects, but potential for gradual gains.",
    },
    {
      label: "D+",
      min: 0.07,
      color: "#FFCC66",
      description:
        "Investment with growth potential, though returns may be slower and less predictable.",
    },
    {
      label: "D",
      min: 0.04,
      color: "#FF9933",
      description:
        "Entry-level investment with uncertain growth, better for cautious investors.",
    },
    {
      label: "D-",
      min: 0.01,
      color: "#ff6600",
      description:
        "Speculative investment with minimal growth prospects, ideal for those open to high risk and variable returns.",
    },
  ];
  // Calculate the marker position in percentage
  const positionPercentage: number = ((value - 0.01) * 100) / (0.45 - 0.01);

  // Define the explicit gradient background with each color stop percentage
  const gradient = `
    linear-gradient(to right, 
      #ff6600 0%, 
      #FF9933 10%, 
      #FFCC66 20%, 
      #FFE57F 30%, 
      #FFFF99 40%, 
      #FFFF33 50%, 
      #E6FF1A 60%, 
      #ccff00 70%, 
      #99ff00 80%, 
      #66ff00 85%, 
      #33ff00 90%, 
      #00ff00 100%
    )`;

  // Determine grade based on the value
  const grade: Grade =
    grades.find((g) => value >= g.min) || grades[grades.length - 1];

  return (
    <Flex vertical style={{ width: "100%", marginBottom: 16 }} gap={8}>
      <Flex gap={8}>
        {/* <Flex
          align="center"
          justify="center"
          style={{
            border: "2px solid",
            borderColor: COLORS.borderColorDark,
            borderRadius: 8,
            backgroundColor: "white",
            height: 50,
            whiteSpace: "nowrap",
            padding: "0 16px",
          }}
        >
          <Tooltip title={`Grade ${grade.label}`}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.heading,
              }}
            >
              {grade.label}
            </Typography.Text>
          </Tooltip>
        </Flex> */}
        <div
          style={{
            minWidth: "calc(100%)",
            height: "50px",
            background: gradient,
            position: "relative",
            borderRadius: "4px",
          }}
        >
          {" "}
          <div
            style={{
              position: "absolute",
              left: `${positionPercentage}%`,
              top: "0",
              transform: "translateX(-50%)",
              width: "5px",
              height: "50px",
              backgroundColor: COLORS.primaryColor,
              borderRadius: "2px",
            }}
          />
        </div>
      </Flex>
    </Flex>
  );
};

export default LivestIndexRange;
