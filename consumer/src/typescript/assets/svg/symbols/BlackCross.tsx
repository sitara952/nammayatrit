import React, { FC } from "react";
import Svg, { Path } from 'react-native-svg';

interface BlackCrossProps {
  height?: number;
  width?: number;
}

const BlackCross: FC<BlackCrossProps> = ({ height, width }) => {
  return <Svg width={width ? width : 15} height={height ? height : 14} viewBox="0 0 15 14" fill="none" accessibilityLabel="Close">
    <Path d="M2.03033 0.502871C1.73744 0.209981 1.26256 0.209981 0.969668 0.502871C0.676777 0.795761 0.676777 1.27064 0.969668 1.56353L6.4393 7.0332L0.969668 12.5029C0.676777 12.7958 0.676777 13.2706 0.969668 13.5635C1.26256 13.8564 1.73744 13.8564 2.03033 13.5635L7.5 8.0939L12.9697 13.5635C13.2626 13.8564 13.7374 13.8564 14.0303 13.5635C14.3232 13.2706 14.3232 12.7958 14.0303 12.5029L8.5607 7.0332L14.0303 1.56353C14.3232 1.27064 14.3232 0.795761 14.0303 0.502871C13.7374 0.209981 13.2626 0.209981 12.9697 0.502871L7.5 5.9725L2.03033 0.502871Z" fill="black" />
  </Svg>
}


export default BlackCross;
