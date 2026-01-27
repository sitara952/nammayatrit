import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CalenderIcon({ fill = '#09941E' }: { fill: string | undefined }) {
  return (
    <Svg
      width={'100%'}
      height={'100%'}
      viewBox="0 0 12 12"
      fill="none"
    >
      <Path
        d="M10.2 4.8v-.6a1.8 1.8 0 00-1.8-1.8H3.6a1.8 1.8 0 00-1.8 1.8v.6h8.4z"
        fill={fill}
      />
      <Path
        d="M3.602 2.4V1.2M8.398 2.4V1.2M10.2 5.54V4.2a1.8 1.8 0 00-1.8-1.8H3.6a1.8 1.8 0 00-1.8 1.8v3.6a1.8 1.8 0 001.8 1.8h1.1"
        stroke={fill}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.25 6.3l.45 1.5 1.5.45-1.5.45-.45 1.5-.45-1.5-1.5-.45 1.5-.45.45-1.5z"
        fill={fill}
        stroke={fill}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default CalenderIcon;
