import * as React from "react"
import Svg, { Path } from "react-native-svg"

export const QRIcon = ({fill = '#000'}) => {
  return (
    <Svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"

    >
      <Path
        d="M3 11.266v-8h8v8H3zm2-2h4v-4H5v4zm-2 12v-8h8v8H3zm2-2h4v-4H5v4zm8-8v-8h8v8h-8zm2-2h4v-4h-4v4zm4 12v-2h2v2h-2zm-6-6v-2h2v2h-2zm2 2v-2h2v2h-2zm-2 2v-2h2v2h-2zm2 2v-2h2v2h-2zm2-2v-2h2v2h-2zm0-4v-2h2v2h-2zm2 2v-2h2v2h-2z"
        fill={fill}
      />
    </Svg>
  )
}

