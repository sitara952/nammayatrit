import * as React from "react"
import Svg, { Rect } from "react-native-svg"

function OtpIcon({ fill = "#fff" }: { fill: string | undefined }) {
  return (
    <Svg
      width={'100%'}
      height={'100%'}
      viewBox="0 0 50 19"
      fill="none"
    >
      <Rect
        x={0.324219}
        y={0.595703}
        width={7.84121}
        height={17.9785}
        rx={3}
        fill={fill}
      />
      <Rect
        x={27.8242}
        y={0.595703}
        width={7.84121}
        height={17.9785}
        rx={3}
        fill={fill}
      />
      <Rect
        x={41.5742}
        y={0.595703}
        width={7.84121}
        height={17.9785}
        rx={3}
        fill={fill}
      />
      <Rect
        x={14.0742}
        y={0.595703}
        width={7.84121}
        height={17.9785}
        rx={3}
        fill={fill}
      />
    </Svg>
  )
}

export default OtpIcon
