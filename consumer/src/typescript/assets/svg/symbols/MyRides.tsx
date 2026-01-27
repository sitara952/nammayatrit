import React from "react";
import { FC } from "react"
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";


const MyRides : FC = () => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_380_3827)">
      <Path
        d="M17.5564 17.4956L16.8844 12.8516L13.0204 12.2036L11.3644 12.0476L6.52839 6.08361L3.94839 6.11961L3.31239 4.70361H2.40039V7.97961L5.44839 7.94361L8.55639 11.7836L2.40039 11.6636V19.7156L9.82839 19.7996C10.1404 20.8436 11.0884 21.5996 12.2404 21.5996C13.3924 21.5996 14.3044 20.8556 14.6284 19.8476L16.7884 19.8716L17.5684 17.4956H17.5564Z"
        fill="black"
      />
      <Path
        d="M21.516 5.13393L19.9046 3.59947L15.7333 7.82002L13.4446 5.59285L12 7.12593L14.856 9.98193H16.668L21.516 5.13393Z"
        fill="black"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_380_3827">
        <Rect width="19.116" height="18" fill="white" transform="translate(2.40039 3.59961)" />
      </ClipPath>
    </Defs>
  </Svg>
    )
}

export default MyRides;