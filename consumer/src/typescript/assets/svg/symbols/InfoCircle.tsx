import React, {FC} from 'react';
import Svg, {Path} from 'react-native-svg';

interface InfoCircleProps {
  height?: number;
  width?: number;
  color?: string;
}

const InfoCircle: FC<InfoCircleProps> = ({
  height = 21,
  width = 20,
  color,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 21 20" fill={color}>
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M2.08752 9.9974C2.08752 5.39823 5.82086 1.66406 10.4209 1.66406C15.0292 1.66406 18.7542 5.39823 18.7542 9.9974C18.7542 14.5982 15.0292 18.3307 10.4209 18.3307C5.82086 18.3307 2.08752 14.5982 2.08752 9.9974ZM9.68752 6.83906C9.68752 6.4399 10.0209 6.10573 10.4209 6.10573C10.8209 6.10573 11.1459 6.4399 11.1459 6.83906V10.5224C11.1459 10.9232 10.8209 11.2474 10.4209 11.2474C10.0209 11.2474 9.68752 10.9232 9.68752 10.5224V6.83906ZM10.4291 13.8979C10.0208 13.8979 9.69576 13.5646 9.69576 13.1646C9.69576 12.7646 10.0208 12.4396 10.4208 12.4396C10.8291 12.4396 11.1541 12.7646 11.1541 13.1646C11.1541 13.5646 10.8291 13.8979 10.4291 13.8979Z" fill="#7B8997"/>
    </Svg>
  );
};

export default InfoCircle;