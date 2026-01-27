import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
const OnboardingStop = () => (
    <Svg width={26} height={26} fill="none">
        <Rect width={25.773} height={25.773} x={0.094} fill="#F24649" rx={12.887} />
        <Path
            fill="#fff"
            d="M12.953 12.33a2.203 2.203 0 1 0 0-4.404 2.203 2.203 0 0 0 0 4.405ZM16.855 16.016a3.133 3.133 0 0 0-2.774-2.396 12.276 12.276 0 0 0-1.13-.046c-.387 0-.753.012-1.13.046-1.346.114-2.453 1.095-2.772 2.396v.035c-.194.787.4 1.563 1.22 1.563h5.387c.81 0 1.415-.776 1.221-1.563v-.035h-.022Z"
        />
    </Svg>
);
export default OnboardingStop;
