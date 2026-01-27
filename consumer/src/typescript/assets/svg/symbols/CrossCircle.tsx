import * as React from "react"
import Svg, { Defs, G, Path } from "react-native-svg"

export const CrossCircle= ({ fill = '#505050', size = 26 }: { fill: string | undefined, size: number | undefined }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 26 26"
    fill="none"

  >
    <G filter="url(#filter0_dddd_19798_134049)">
      <Path fill="#fff" d="M8 8H17V16H8z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 12c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5c0 5.239-4.262 9.5-9.5 9.5S3.5 17.239 3.5 12zm12.515-3.017a.88.88 0 00-1.24 0l-1.77 1.78-1.78-1.78a.88.88 0 00-1.24 0 .88.88 0 000 1.24l1.78 1.78-1.78 1.77a.88.88 0 00.62 1.5c.23 0 .45-.09.62-.26l1.78-1.77 1.78 1.77c.17.18.39.26.61.26.23 0 .45-.09.62-.26a.868.868 0 000-1.23l-1.78-1.78 1.78-1.78a.88.88 0 000-1.24z"
        fill={fill}
      />
    </G>
    <Defs></Defs>
  </Svg>
  )
}
