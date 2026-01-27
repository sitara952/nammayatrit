import React from "react";
import { FC } from "react";
import Svg, { Path } from "react-native-svg";

interface InfoFilledProps {
  color?: string;
  size?: number;
}

const InfoFilled: FC<InfoFilledProps> = ({
  color = "#5B6777",
  size = 16,
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.50399 10.4618C8.50399 10.7378 8.27999 10.9618 8.00399 10.9618C7.72799 10.9618 7.50399 10.7378 7.50399 10.4618V7.59584C7.50399 7.31984 7.72799 7.09584 8.00399 7.09584C8.27999 7.09584 8.50399 7.31984 8.50399 7.59584V10.4618ZM7.49999 5.52717C7.49999 5.25117 7.72399 5.02717 7.99999 5.02717C8.27599 5.02717 8.49999 5.25117 8.49999 5.52717C8.49999 5.80317 8.27599 6.0485 7.99999 6.0485C7.72399 6.0485 7.49999 5.84517 7.49999 5.56917V5.52717ZM7.99999 1.6665C4.50799 1.6665 1.66666 4.50717 1.66666 7.99984C1.66666 11.4918 4.50799 14.3332 7.99999 14.3332C11.492 14.3332 14.3333 11.4918 14.3333 7.99984C14.3333 4.50717 11.492 1.6665 7.99999 1.6665Z"
        fill={color}
      />
    </Svg>
  );
};

export default InfoFilled;
