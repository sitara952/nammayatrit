import * as React from 'react';
import Svg, {Rect, Path, G, Defs, Filter, FeBlend, FeFlood, FeOffset, FeColorMatrix, FeComposite, LinearGradient, Stop, FeGaussianBlur} from 'react-native-svg';

function TurboIcon() {
  return ( 
    <Svg width="33" height="33" viewBox="0 0 33 33" fill="none">
      <G filter="url(#filter0_d_345_2087)">
        <Rect x="4.5" y="2.95215" width="24" height="24" rx="12" fill="url(#paint0_linear_345_2087)"/>
        <Path d="M14.6644 20.9521L22.5 13.4721H18.3562L19.8253 9.95215H13.9863L11.5 16.4055H15.5308L14.1747 20.9521H14.6644Z" fill="white"/>
      </G>
      <Defs>
        <Filter id="filter0_d_345_2087" x="0.5" y="0.952148" width="32" height="32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <FeFlood flood-opacity="0" result="BackgroundImageFix"/>
        <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <FeOffset dy="2"/>
        <FeGaussianBlur stdDeviation="2"/>
        <FeComposite in2="hardAlpha" operator="out"/>
        <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"/>
        <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_345_2087"/>
        <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_345_2087" result="shape"/>
        </Filter>
          <LinearGradient id="paint0_linear_345_2087" x1="16.5" y1="2.95215" x2="26.8125" y2="21.6549" gradientUnits="userSpaceOnUse">
          <Stop stop-color="#14A255"/>
          <Stop offset="1" stop-color="#0FE973"/>
        </LinearGradient>
      </Defs>
    </Svg>
);
}

export default TurboIcon;

