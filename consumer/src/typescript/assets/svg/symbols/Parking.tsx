import React, {FC} from 'react';
import Svg, {Path} from 'react-native-svg';

interface ParkingProps {
  height?: number;
  width?: number;
  color?: string;
}

const Parking: FC<ParkingProps> = ({
  height = 21,
  width = 20,
  color,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 21" fill={color}>
    <Path d="M11.3944 9.72593H9.23425V7.32812H11.3944C12.0571 7.32812 12.5938 7.86478 12.5938 8.52743C12.5938 9.1891 12.0573 9.72593 11.3944 9.72593Z" fill="#5B6777"/>
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M2.50427 9.9987C2.50427 5.62644 6.04868 2.08203 10.4209 2.08203C14.7932 2.08203 18.3376 5.62644 18.3376 9.9987C18.3376 14.3709 14.7932 17.9154 10.4209 17.9154C6.04868 17.9154 2.50427 14.3709 2.50427 9.9987ZM8.60928 6.07506C8.26411 6.07506 7.98428 6.35487 7.98428 6.70006V13.2976C7.98428 13.6428 8.26411 13.9226 8.60928 13.9226C8.95444 13.9226 9.23427 13.6428 9.23427 13.2976V10.9729H11.3944C12.7473 10.9729 13.8438 9.87678 13.8438 8.52436C13.8438 7.17136 12.7474 6.07506 11.3944 6.07506H8.60928Z" fill="#5B6777"/>
    </Svg>
  );
};

export default Parking;