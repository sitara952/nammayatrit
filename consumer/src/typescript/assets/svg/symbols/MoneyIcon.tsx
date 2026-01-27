import * as React from "react"
import Svg, { Path } from "react-native-svg"

export const MoneyIcon = ({fill = "#14171F", size= 24}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"

    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 10.459a1.54 1.54 0 000 3.08 1.54 1.54 0 000-3.08z"
        fill={fill}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.086 12.7a.75.75 0 01-1.5 0v-1.4a.75.75 0 011.5 0v1.4zm-6.087 2.34A3.042 3.042 0 018.961 12a3.042 3.042 0 013.038-3.04A3.042 3.042 0 0115.037 12a3.042 3.042 0 01-3.038 3.04zM7.414 12.7a.75.75 0 01-1.5 0v-1.4a.75.75 0 011.5 0v1.4zm10.398-8.25H6.188C3.982 4.45 2.5 5.995 2.5 8.3v7.4c0 2.302 1.482 3.85 3.688 3.85h11.623c2.207 0 3.689-1.548 3.689-3.85V8.3c0-2.304-1.482-3.85-3.688-3.85z"
        fill={fill}
      />
    </Svg>
  )
}
