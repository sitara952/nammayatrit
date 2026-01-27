import React from "react";
import { FC } from "react";
import Svg, { Path } from "react-native-svg";

interface ExportIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const ExportIcon: FC<ExportIconProps> = ({
  color = "#14171F",
  size = 16,
  strokeWidth = 1.5,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      accessible={false}
    >
      <Path
        d="M1.99988 8C1.99988 11.3137 4.68619 14.0001 7.9999 14.0001C11.3136 14.0001 14 11.3137 14 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M7.99997 9.50007V2M7.99997 2L10.25 4.25002M7.99997 2L5.74994 4.25002"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ExportIcon;
