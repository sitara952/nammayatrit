import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

interface LeftArrowProps extends ViewProps {
  fill?: string;
}

const LeftArrow : React.FC<LeftArrowProps> = ({fill ='#525461' , ...prop}) => {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel={prop.accessibilityLabel ?? "Go back"}
    >
      <Path d="M21 11.062H3.928v1.857H21v-1.857z" fill={fill} />
      <Path
        d="M8.329 5.418l1.568 1.003C8.542 8.546 6.203 10.876 5.014 12c1.18 1.123 3.519 3.444 4.883 5.579L8.33 18.58c-1.356-2.125-3.844-4.53-4.846-5.467A1.518 1.518 0 013 12.009c0-.418.176-.817.483-1.105 1.002-.937 3.49-3.342 4.846-5.467v-.019z"
        fill={fill}
      />
    </Svg>
  );
}

export default LeftArrow;
