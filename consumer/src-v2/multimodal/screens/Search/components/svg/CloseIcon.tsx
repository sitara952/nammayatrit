import Svg, { Path } from 'react-native-svg';

function CrossIcon({ fill = '#313131' }) {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
                d="M13.9951 3.40234L13.9922 3.4043L13.9961 3.4082L13.9668 3.42969L9.39746 7.99805L13.9971 12.5977L12.5947 14L7.99512 9.40039L3.41016 13.9863L2.00781 12.584L6.59277 7.99805L2.00977 3.41602L2.0166 3.4082L3.41797 2.00586L3.45898 2.05957L7.99512 6.5957L12.5918 2L13.9951 3.40234Z"
                fill={fill}
            />
        </Svg>
    );
}

export default CrossIcon;
