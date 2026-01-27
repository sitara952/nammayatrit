import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent({color}: {color: string}) {
  return (
    <Svg
      width={27}
      height={20}
      viewBox="0 0 27 20"
      fill="none"
    >
      <Path
        d="M22 0H5a5 5 0 00-5 5v10a5 5 0 005 5h17a5 5 0 005-5V5a5 5 0 00-5-5z"
        fill={color}
      />
      <Path
        d="M27 9.37c-2.91-3.7-7.38-6.03-12.6-6.33-.44-.03-.9-.04-1.37-.04C7.01 3 2.79 5.17 0 8.16V15c0 .17.03.32.05.49.09-.26.16-.53.27-.78 1.24-2.77 3.69-5.04 6.9-6.41 1.77-.75 3.78-1.15 5.81-1.15 4.69 0 8.95 2.03 11.39 5.42.95 1.33 1.64 2.91 1.99 4.56 0 .05.01.1.02.15.35-.69.57-1.45.57-2.28V9.37z"
        fill="#fff"
      />
      <Path
        d="M12.67 11.32s-3.61 2.88-6.21 4.12l1.1 2.71 3.5-1.53V20h4.05v-8.68h-2.44z"
        fill="#fff"
      />
    </Svg>

  );
}

export default SvgComponent;
