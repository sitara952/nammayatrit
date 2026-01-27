import { Svg, Path } from 'react-native-svg';

export const Cross = ({ fill = '#EB544A' }: { fill: string | undefined }) => {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
                d="M3.79543 2.29832L3.72472 2.22761L3.65401 2.29832L2.59335 3.35898L2.52264 3.42969L2.59335 3.5004L12.5022 13.4092L12.5729 13.4799L12.6436 13.4092L13.7043 12.3486L13.775 12.2778L13.7043 12.2071L3.79543 2.29832Z"
                fill={fill}
                stroke={fill}
                strokeWidth="0.2"
            />
            <Path
                d="M12.6436 2.6064L12.5729 2.53569L12.5022 2.6064L2.59335 12.5152L2.52264 12.5859L2.59335 12.6566L3.65401 13.7173L3.72472 13.788L3.79543 13.7173L13.7043 3.80848L13.775 3.73777L13.7043 3.66706L12.6436 2.6064Z"
                fill={fill}
                stroke={fill}
                strokeWidth="0.2"
            />
        </Svg>
    );
};
