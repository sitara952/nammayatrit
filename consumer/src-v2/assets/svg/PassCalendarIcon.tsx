import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PassCalendarIconProps {
    fill?: string;
    width?: number;
    height?: number;
    isToday?: boolean;
}

const PassCalendarIcon: React.FC<PassCalendarIconProps> = ({
    fill = '#09941E',
    width = 29,
    height = 31,
    isToday = true,
}) => {
    if (isToday) {
        return (
            <Svg width={width} height={height} viewBox="0 0 29 31" fill="none">
                <Path
                    d="M27.7406 12.5414V10.6414C27.7406 7.4933 25.1887 4.94141 22.0406 4.94141H6.84062C3.69251 4.94141 1.14062 7.4933 1.14062 10.6414V12.5414H27.7406Z"
                    fill={fill}
                />
                <Path
                    d="M6.84375 4.94062V1.14062"
                    stroke={fill}
                    strokeWidth="2.28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M22.0332 4.94062V1.14062"
                    stroke={fill}
                    strokeWidth="2.28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M27.7406 14.8824V10.6414C27.7406 7.4933 25.1887 4.94141 22.0406 4.94141H6.84062C3.69251 4.94141 1.14062 7.4933 1.14062 10.6414V22.0414C1.14062 25.1895 3.69251 27.7414 6.84062 27.7414H10.3224"
                    stroke={fill}
                    strokeWidth="2.28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M21.5656 17.291L22.9906 22.041L27.7406 23.466L22.9906 24.891L21.5656 29.641L20.1406 24.891L15.3906 23.466L20.1406 22.041L21.5656 17.291Z"
                    fill={fill}
                    stroke={fill}
                    strokeWidth="2.28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        );
    }

    return (
        <Svg width={width} height={height} viewBox="0 0 28 30" fill="none">
            <Path
                d="M26.125 11.875V10.0938C26.125 7.1424 23.7326 4.75 20.7812 4.75H6.53125C3.5799 4.75 1.1875 7.1424 1.1875 10.0938V11.875H26.125Z"
                fill={fill}
            />
            <Path
                d="M6.53125 4.75V1.1875"
                stroke={fill}
                strokeWidth="2.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M20.7812 4.75V1.1875"
                stroke={fill}
                strokeWidth="2.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M26.125 12.3016V10.0938C26.125 7.1424 23.7326 4.75 20.7812 4.75H6.53125C3.5799 4.75 1.1875 7.1424 1.1875 10.0938V20.7812C1.1875 23.7326 3.5799 26.125 6.53125 26.125H9.76974"
                stroke={fill}
                strokeWidth="2.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Decorative icon - Clock for Custom Date */}
            {(
                <Path
                    d="M20.7812 15.4375C16.8461 15.4375 13.6562 18.6274 13.6562 22.5625C13.6562 26.4976 16.8461 29.6875 20.7812 29.6875C24.7164 29.6875 27.9062 26.4975 27.9062 22.5625C27.9062 18.6275 24.7164 15.4375 20.7812 15.4375ZM24.3993 25.4561C24.0463 25.8963 23.8778 25.9648 23.3542 25.9648C22.9645 25.9648 22.9095 25.8132 22.5808 25.5507L20.3542 23.7694C19.9316 23.4319 19.6863 22.9196 19.6863 22.3786V19.7067C19.6863 18.7231 19.7968 18.1094 20.7812 18.1094C21.7657 18.1094 21.7957 19.3498 21.7957 20.3334V22.1493L23.3542 23.3957C24.1214 24.0097 25.0135 24.6881 24.3993 25.4561Z"
                    fill={fill}
                />
            )}
        </Svg>
    );
};

export default PassCalendarIcon;
