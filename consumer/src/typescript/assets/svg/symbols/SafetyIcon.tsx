import React, { FC } from "react"
import Svg, { Path } from "react-native-svg"


const SafetyIcon : FC = () => {
    return (
  <Svg width={'100%'} height={'100%'} viewBox="0 0 26 25" fill="none">
    <Path
      d="M3 4.23978C3.04093 5.54422 3.16371 9.33525 3.28649 13.1399C3.46385 18.3576 7.74761 22.502 13 22.502C18.2387 22.502 22.5362 18.3576 22.7135 13.1399C22.8363 9.33525 22.9591 5.54422 23 4.23978L12.9864 2.50195L3 4.23978Z"
      fill="#14171F"
    />
    <Path
      d="M8.83398 11.8067C10.6399 13.0102 11.8434 14.5849 11.8434 14.5849H12.4453C12.4453 14.5849 14.2509 11.5753 17.8622 9.16797"
      stroke="white"
      strokeWidth="1.5"
    />
  </Svg>
    )
}

export default SafetyIcon;
