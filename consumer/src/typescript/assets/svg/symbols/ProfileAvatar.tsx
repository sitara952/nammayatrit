import * as React from "react"
import Svg, { Mask, Circle, G } from "react-native-svg"

function SvgComponent() {
  return (
    <Svg
      width={88}
      height={88}
      viewBox="0 0 88 88"
      fill="none"
    >
      <Mask
        id="a"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={88}
        height={88}
      >
        <Circle cx={44} cy={44} r={44} fill="#D9D9D9" />
      </Mask>
      <G mask="url(#a)">
        <Circle cx={44} cy={44} r={44} fill="#fff" />
      </G>
      <Mask
        id="b"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={88}
        height={88}
      >
        <Circle cx={44} cy={44} r={44} fill="#673CB5" />
      </Mask>
      <G mask="url(#b)" fill="#FFD506" stroke="#FFD506" strokeWidth={4.5}>
        <Circle cx={44.0017} cy={92.8846} r={36.8611} />
        <Circle cx={44.0026} cy={34.4635} r={12.4167} />
      </G>
    </Svg>
  )
}

export default SvgComponent
