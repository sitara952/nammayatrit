import React, { useEffect, useState } from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const RetryIcon: React.FC = () => {
    const [colorIndex, setColorIndex] = useState(0);

    // Define an array of colors to cycle through
    const colors = ['#E5E6E8', '#D9DCD0', '#BBBEC5'];

    useEffect(() => {
        const interval = setInterval(() => {
            setColorIndex(prevIndex => {
                if (prevIndex === 0) {
                    return colors.length - 1; // Cycle back to the last color
                } else {
                    return prevIndex - 1; // Move to the previous color
                }
            });
        }, 500); // Change color every second

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <Svg width={88} height={28} viewBox="0 0 88 28" fill="none">
            <Rect x={60} width={28} height={28} rx={14} fill="#14A255" />
            <Path
                d="M71.8588 20.9993L81.0003 12.2727H76.1659L77.8799 8.16602H71.0677L68.167 15.6949H72.8696L71.2874 20.9993H71.8588Z"
                fill="white"
            />
            <Rect width={28} height={28} rx={14} fill="#E0E3E8" />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.3335 13.113C7.3335 9.92078 9.89372 7.33301 13.0519 7.33301C14.5685 7.33301 16.023 7.94197 17.0955 9.02592C18.1679 10.1099 18.7703 11.58 18.7703 13.113C18.7703 16.3051 16.2101 18.8929 13.0519 18.8929C9.89372 18.8929 7.3335 16.3051 7.3335 13.113ZM18.6757 17.7692L20.3788 19.144H20.4084C20.753 19.4922 20.753 20.0569 20.4084 20.4051C20.0638 20.7534 19.5052 20.7534 19.1606 20.4051L17.7473 18.7853C17.6137 18.6507 17.5386 18.4679 17.5386 18.2773C17.5386 18.0866 17.6137 17.9038 17.7473 17.7692C18.005 17.5133 18.418 17.5133 18.6757 17.7692Z"
                fill="#7B8997"
            />
            <Path
                d="M42.7257 9.76758L45.6829 12.7248C46.0734 13.1153 46.0734 13.7484 45.6829 14.139L42.4814 17.3404"
                stroke={colors[colorIndex]} // Change color dynamically
                strokeWidth={2.03571}
                strokeMiterlimit={10}
            />
            <Path
                d="M50.9497 9.76758L53.8996 12.7174C54.293 13.1108 54.2897 13.7496 53.8923 14.1389L50.624 17.3404"
                stroke={colors[(colorIndex + 1) % colors.length]} // Change color dynamically
                strokeWidth={2.03571}
                strokeMiterlimit={10}
            />
            <Path
                d="M34.2443 9.76758L37.2015 12.7248C37.592 13.1153 37.592 13.7484 37.2015 14.139L34 17.3404"
                stroke={colors[(colorIndex + 2) % colors.length]} // Change color dynamically
                strokeWidth={2.03571}
                strokeMiterlimit={10}
            />
        </Svg>
    );
};

export default RetryIcon;
