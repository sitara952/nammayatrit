import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';

function FlashIcon({fillColor = 'black'}: {fillColor: string | undefined}) {
  return (
    <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
      <Rect x="0.5" y="0.0332031" width="24" height="24" rx="12" fill="white" />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.1955 6.42706C10.3187 6.10382 10.6289 5.88965 10.9756 5.88965H14.103C14.6792 5.88965 15.0822 6.45951 14.8902 7.00277C14.8869 7.01213 14.8832 7.02139 14.8794 7.03052L13.5707 10.102H16.3564C17.074 10.102 17.4573 10.9474 16.9844 11.4871L11.3774 17.887C10.7954 18.5513 9.71519 17.9751 9.94274 17.1217L10.9747 13.2517H8.64276C8.06237 13.2517 7.65905 12.6741 7.85894 12.1293C7.86096 12.1238 7.86309 12.1183 7.86532 12.1128L10.1955 6.42706Z"
        fill={fillColor}
      />
    </Svg>
  );
}

export default FlashIcon;
