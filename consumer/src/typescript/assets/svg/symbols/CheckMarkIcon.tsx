import React from "react";
import { FC } from "react";
import Svg, { Path } from "react-native-svg";

interface CheckMarkIconProps {
  color?: string;
  size?: number;
}

const CheckMarkIcon: FC<CheckMarkIconProps> = ({ color = "#14A255", size = 20 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      accessible={false}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4225 5.40033C16.7479 5.72576 16.7479 6.2534 16.4225 6.57884L8.40167 14.5997C8.07624 14.9251 7.5486 14.9251 7.22316 14.5997L3.57733 10.9538C3.25189 10.6284 3.25189 10.1008 3.57733 9.77533C3.90277 9.44989 4.4304 9.44989 4.75584 9.77533L7.81242 12.8319L15.244 5.40033C15.5694 5.07489 16.0971 5.07489 16.4225 5.40033Z"
        fill={color}
      />
    </Svg>
  );
};

export default CheckMarkIcon;
