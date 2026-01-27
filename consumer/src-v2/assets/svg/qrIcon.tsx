import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function QrIcon({ fill = '#016ACD' }: { fill: string | undefined }) {
  return (
    <Svg
      width={'100%'}
      height={'100%'}
      viewBox="0 0 24 23"
      fill="none"
    >
      <G clipPath="url(#clip0_2704_4610)">
        <Path
          d="M10.717 10.201v-6.32H4.086v6.331h6.642l-.01-.01zM10.728 18.596H4.086v-6.32h6.631v6.32h.011zM16.495 12.275h-3.212v3.056h3.212v-3.056z"
          fill={fill}
        />
        <Path
          d="M19.706 15.33h-3.212v3.056h3.212V15.33zM19.914 10.212h-6.63V3.881h6.63v6.331z"
          fill={fill}
        />
        <Path
          d="M.802 4.52A3.744 3.744 0 014.546.777M4.52 21.698a3.743 3.743 0 01-3.743-3.743M23.198 17.955a3.743 3.743 0 01-3.743 3.743M19.48.777a3.743 3.743 0 013.743 3.743"
          stroke={fill}
          strokeWidth={1.5537}
          strokeMiterlimit={10}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2704_4610">
          <Path fill="#fff" d="M0 0H24V22.4743H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default QrIcon
