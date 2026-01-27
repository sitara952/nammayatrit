import * as React from "react"
import Svg, { G, Circle, Defs, Filter, FeDropShadow } from "react-native-svg"

interface LocationRoundIconProps {
    height ?: number;
    width ?: number;
    outerColor ?: string;
    innerColor ?: string;
}

const LocationRoundIcon = (props: LocationRoundIconProps) => {
  const {
    height = 24,
    width = 24,
    outerColor = "#fff",
    innerColor = "#F78118",
  } = props;

  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Defs>
        <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <FeDropShadow dx="0" dy="0" stdDeviation="3" floodColor="black" floodOpacity="0.3" />
        </Filter>
      </Defs>

      <G filter="url(#shadow)">
        <Circle cx={11} cy={11} r={7} fill={outerColor} />
        <Circle cx={11} cy={11} r={4} fill={innerColor} />
      </G>
    </Svg>
  );
};

export default LocationRoundIcon
