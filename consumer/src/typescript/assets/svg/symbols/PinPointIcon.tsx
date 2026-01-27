import * as React from "react"
import Svg, { Path } from "react-native-svg"

interface PinPointIconProps {
    height?: number;
    width?: number;
    color?: string;
}

const PinPointIcon = (props : PinPointIconProps) => {
    const { height, width, color } = props
    return (
        <Svg
            width={width?width:16}
            height={height ? height : 17}
            viewBox="0 0 16 17"
            fill="none">

            <Path
                d="M8.133 2.5A5.133 5.133 0 003 7.633c0 3.376 3.338 4.992 3.756 5.368.427.385.78 1.245.922 1.734.069.237.263.357.455.362a.485.485 0 00.456-.362c.142-.489.495-1.35.922-1.734.418-.376 3.756-1.992 3.756-5.368A5.133 5.133 0 008.133 2.5zm0 6.533a1.4 1.4 0 110-2.8 1.4 1.4 0 010 2.8z"
                fill={color ? color : "#454545"}
            />
        </Svg>
    )
}

export default PinPointIcon
