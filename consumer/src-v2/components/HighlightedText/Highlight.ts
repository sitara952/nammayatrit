import type { TextStyle } from 'react-native';

interface HighlightProps {
    keywords?: string[];
    style?: TextStyle;
    onPress?: (keyword: string) => void;
    className?: string;
}

export class Highlight {
    keywords: string[];
    style: TextStyle;
    onPress: (keyword: string) => void;
    className?: string;
    regexSource: string[];

    constructor({
        keywords = [], // Ensure it defaults to an empty array
        style = {},
        onPress = () => {},
        className = '',
    }: Partial<HighlightProps> = {}) {
        // Allows creating instances without mandatory parameters
        this.keywords = Array.isArray(keywords) ? keywords : []; // Ensure it's always an array
        this.style = style;
        this.onPress = onPress;
        this.className = className;
        this.regexSource = this.keywords.map(keyword => `(${keyword.replace(/"/g, '').trim()})`);
    }
}
