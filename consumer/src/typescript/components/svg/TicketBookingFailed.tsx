import * as React from 'react';
import Svg, { SvgProps, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
const TicketBookingFailed = (props: SvgProps) => (
    <Svg width={78} height={87} fill="none" {...props}>
        <Path
            fill="url(#a)"
            d="M61.262 6.075a11.18 11.18 0 0 0-4.906-4.86C53.954.002 50.81.002 44.522.002h-1.404a3.32 3.32 0 0 0-2.027.69l-6.765 5.211a3.32 3.32 0 0 1-4.053 0L23.504.69A3.32 3.32 0 0 0 21.478 0h-3.321C11.869 0 8.725 0 6.323 1.211a11.18 11.18 0 0 0-4.906 4.86C.191 8.455.191 11.57.191 17.799v51.404c0 6.23 0 9.344 1.223 11.723A11.188 11.188 0 0 0 6.32 85.79C8.722 87 11.866 87 18.154 87h3.723a3.32 3.32 0 0 0 2.027-.69l6.363-4.902a3.32 3.32 0 0 1 4.053 0l6.363 4.902a3.32 3.32 0 0 0 2.026.69h1.807c6.288 0 9.432 0 11.833-1.211a11.188 11.188 0 0 0 4.907-4.864c1.222-2.379 1.222-5.493 1.222-11.723V17.798c0-6.23 0-9.344-1.222-11.723h.006Z"
        />
        <Circle cx={62.096} cy={34.908} r={14.096} stroke="#FF6421" strokeWidth={2.7} />
        <Path stroke="#FF6421" strokeWidth={2.7} d="m57.988 30.727 8.528 8.527M66.516 30.719l-8.528 8.527" />
        <Defs>
            <LinearGradient id="a" x1={31.335} x2={31.335} y1={22.5} y2={71.5} gradientUnits="userSpaceOnUse">
                <Stop stopColor="#E4E4E4" />
                <Stop offset={1} stopColor="#fff" />
            </LinearGradient>
        </Defs>
    </Svg>
);
export default TicketBookingFailed;
