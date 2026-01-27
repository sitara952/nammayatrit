import React, { FC } from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface PersonalTripIconProps {
    color?: string;      // color for the white shapes
    backgroundColor?: string; // color for the rectangle
}

const PersonalTrip: FC<PersonalTripIconProps> = ({
    color = "white",
    backgroundColor = "#252525",
}) => {
    return (
        <Svg
            accessible={false}
            width={"100%"}
            height={"100%"}
            viewBox="0 0 24 24"
            fill="none"
        >
            <Rect width="24" height="24" rx="12" fill={backgroundColor} />
            
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0939 13.2319C10.7306 13.2413 6.57923 13.2699 6.5799 16.1926C6.63523 17.3606 7.46656 18.1446 8.64856 18.1446H15.5526C16.7259 18.1446 17.5566 17.3613 17.6206 16.1766C17.6332 13.2839 13.4686 13.2446 12.0939 13.2319Z"
                fill={color}
            />

            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.104 11.7966C13.7426 11.7966 15.0753 10.464 15.0753 8.826C15.0753 7.18734 13.7426 5.854 12.104 5.854C10.4653 5.854 9.13263 7.18734 9.13263 8.826C9.13263 10.464 10.4653 11.7966 12.104 11.7966Z"
                fill={color}
            />
        </Svg>
    );
};

export default PersonalTrip;
