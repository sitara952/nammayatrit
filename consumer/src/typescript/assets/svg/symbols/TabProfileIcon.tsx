import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function SvgComponent({ size = 41, color = '#969696' }: { size: number, color: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 41 43"
      fill="none"
    >
      <G clipPath="url(#clip0_6975_27249)" fill={color}>
        <Path d="M20.048 19.81c5.47 0 9.9-4.43 9.9-9.9 0-5.47-4.43-9.91-9.9-9.91-5.47 0-9.9 4.43-9.9 9.9 0 5.47 4.43 9.9 9.9 9.9v.01zM39.94 36.371c-1.28-4.92-5.25-8.77-10.26-9.65-3.14-.55-6.36-.85-9.63-.85-3.27 0-6.49.3-9.63.85-5.01.88-8.98 4.73-10.26 9.65-.79 3.04 1.5 6.01 4.65 6.01h30.5c3.14 0 5.44-2.97 4.64-6.01h-.01z" />
      </G>
      <Defs>
        <ClipPath id="clip0_6975_27249">
          <Path fill="#fff" d="M0 0H40.1V42.38H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default SvgComponent
