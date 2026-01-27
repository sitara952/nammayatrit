import React from "react"
import { FC } from "react"
import Svg, { Path, ClipPath, Defs, G, Rect } from "react-native-svg"

interface ReferAndInviteIconProps {
    color?: string;
}

const ReferAndInviteIcon : FC<ReferAndInviteIconProps> = ({ color = "#3B3A3C" }) => {
    return (
        <Svg accessible={false}  width={"100%"} height={"100%"} viewBox={`0 0 16 19`} fill="none">
            <Defs>
                <ClipPath id="clip0_4166_5705">
                    <Rect width={17.94} height={15.456} fill="white" transform="translate(0.600098 0.31958)"/>
                </ClipPath>
            </Defs>
            <G clipPath="url(#clip0_4166_5705)">
                <Path
                    d="M2.6401 15.7754H0.600098V10.6154C0.600098 8.14344 2.6161 6.12744 5.0881 6.12744H10.8241V8.16744H5.0881C3.7321 8.16744 2.6401 9.27144 2.6401 10.6154V15.7754Z"
                    fill={color}
                />
                <Path
                    d="M7.66803 12.8715L6.22803 11.4315L10.152 7.50754V7.03954L6.22803 3.11554L7.66803 1.67554L12.192 6.18754V8.34754L7.66803 12.8715Z"
                    fill={color}
                />
                <Path
                    d="M18.5399 0.31958C16.2959 0.31958 14.4839 2.13158 14.4839 4.37558C14.4839 6.61958 16.2959 8.43158 18.5399 8.43158V0.31958Z"
                    fill={color}
                />
                <Path
                    d="M15.1081 10.1835C13.3201 10.4955 11.9041 11.8755 11.4481 13.6275C11.1721 14.7075 11.9881 15.7755 13.1041 15.7755H18.5401V9.88354C17.3761 9.88354 16.2241 9.99155 15.1081 10.1835Z"
                    fill={color}
                />
            </G>
        </Svg>
    )
}

export default ReferAndInviteIcon;
