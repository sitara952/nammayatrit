import React, {FC} from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

interface AutoSideProps {
  fill?: string;
}

const AutoSide: FC<AutoSideProps> = ({
  fill = colors?.recovered?.neutralMid,
}) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M20.991 15.306l-.819-.818a2.474 2.474 0 00-1.466-.702l.234-.396c.378-.63.477-1.394.27-2.105l-1.16-3.922a2.681 2.681 0 00-1.422-1.655 2.7 2.7 0 00-1.124-.252H6.805A3.8 3.8 0 003 9.261v6.315c0 .53.423.953.954.953h.728c0 1.116.9 2.015 2.015 2.015 1.116 0 2.015-.899 2.015-2.015h7.718c0 1.116.9 2.015 2.015 2.015a2.012 2.012 0 001.862-2.78H21v-.458h-.009zm-9.958.108h-.162a.907.907 0 01-.864-.639l-.98-3.211a.52.52 0 00-.495-.369h-2.59V7.813c0-.54.44-.98.98-.98h4.111v8.581zm4.246-.45a.56.56 0 01-.549.45h-.324V12.76a.599.599 0 00-.593-.593h-1.737V6.832h2.501c.261 0 .495.19.549.441l.837 3.976a.474.474 0 010 .225l-.675 3.49h-.01z"
        fill={fill}
      />
    </Svg>
  );
};

export default AutoSide;
