import Svg, { Path } from 'react-native-svg';

export const Direction = ({ fill = '#0356CA' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.216 6.9866L14.2118 2.98242L13.1512 4.04308L16.114 7.00589H5.10571V8.50589H16.1105L13.1512 11.4653L14.2118 12.5259L18.216 8.52174C18.642 8.09576 18.642 7.41258 18.216 6.9866ZM7.88856 15.495H18.8945V16.995H7.88822L10.8495 19.9562L9.78881 21.0169L5.78464 17.0127C5.35866 16.5868 5.35866 15.9036 5.78464 15.4776L9.78881 11.4734L10.8495 12.5341L7.88856 15.495Z"
                fill={fill}
            />
        </Svg>
    );
};
