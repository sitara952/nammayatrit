import React from "react";
import { FC } from "react";
import Svg, { Path } from "react-native-svg";

interface EmailUserIconProps {
  color?: string;
  size?: number;
}

const EmailUserIcon: FC<EmailUserIconProps> = ({
  color = "#454C55",
  size = 20,
}) => {
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
        d="M10.1174 11.5396C8.41327 11.5512 3.22408 11.5871 3.22491 15.2404C3.29408 16.7004 4.33325 17.6804 5.81075 17.6804H14.4408C15.9074 17.6804 16.9458 16.7012 17.0258 15.2204C17.0416 11.6046 11.8358 11.5554 10.1174 11.5396Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.13 9.74616C12.1784 9.74616 13.8442 8.08037 13.8442 6.03287C13.8442 3.98454 12.1784 2.31787 10.13 2.31787C8.08167 2.31787 6.41583 3.98454 6.41583 6.03287C6.41583 8.08037 8.08167 9.74616 10.13 9.74616Z"
        fill={color}
      />
    </Svg>
  );
};

export default EmailUserIcon;
