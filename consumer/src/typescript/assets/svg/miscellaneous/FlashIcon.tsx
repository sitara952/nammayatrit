import * as React from "react"
import { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg"

interface IconProps {
  style?: ViewStyle
}

function FlashIcon(props : IconProps) {
  return (
    <Svg
      width={10}
      height={14}
      viewBox="0 0 10 14"
      fill="none"
      style={props.style}
      >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.562 1.162a.884.884 0 01.825-.568h3.31A.884.884 0 017.518 1.8l-1.385 3.25h2.949c.759 0 1.165.895.664 1.467L3.812 13.29c-.616.704-1.759.094-1.518-.81l1.092-4.095H.918A.884.884 0 01.096 7.18l2.466-6.018z"
        fill="#F5B63B"
      />
    </Svg>
  )
}

export default FlashIcon;
