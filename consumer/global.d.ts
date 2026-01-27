declare module '*.png' {
    const value: number;
    export default value;
}

declare module '*.webp' {
    const value: number; // For require-style imports
    export default value;
}

declare module '*.lottie' {
    import { AnimatedLottieViewProps } from 'lottie-react-native';
    const content: AnimatedLottieViewProps['source'];
    export default content;
}

declare module 'react-native-animated-linear-gradient';
