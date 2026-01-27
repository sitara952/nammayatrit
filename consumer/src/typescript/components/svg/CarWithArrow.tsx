import Svg, { Path } from 'react-native-svg';

export default function CarSideWithArrow({ fillColor = '#525461' }: { fillColor: string | undefined }) {
    return (
        <Svg width={38} height={14} viewBox="0 0 38 14" fill="none">
            <Path
                d="M4.582 14a1.957 1.957 0 100-3.914 1.957 1.957 0 000 3.914zM19.931 14a1.957 1.957 0 100-3.914 1.957 1.957 0 000 3.914z"
                fill={fillColor}
            />
            <Path
                d="M24.161 6.306l-3.615-.501-1.283-.12-3.758-4.617-9.014.113-3.866 4.546L0 6.276v4.611l3.019 1.551 21.052.221.603-1.843-.519-4.504.006-.006zm-13.214-.901l-6.258.256 2.56-3.072 3.698-.036v2.858-.006zm1.36 0v-2.87l2.363-.023 2.41 2.976-4.773-.089v.006z"
                fill={fillColor}
            />
            <Path
                d="M13.314.665A1.122 1.122 0 0012.289 0h-1.783c-.443 0-.844.26-1.024.665l-.289.647h4.409l-.288-.647z"
                fill={fillColor}
            />
            <Path
                d="M33.17 3.388l3.596 3.49.007 1.089-3.478 3.595M36.78 7.464h-6.212"
                stroke={fillColor}
                strokeWidth={1.34586}
                strokeMiterlimit={10}
            />
        </Svg>
    );
}
