// eslint-disable-next-line
// @ts-nocheck
import React from 'react';
import { Text } from 'react-native';
import { splitText } from './utils';
import type { HighlighterProps } from './utils';
import { mentionRegexTester, hashtagRegexTester, emailRegexTester, urlRegexTester } from './regexes';
import type { TextStyle, TextProps } from 'react-native';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';

interface HighlightTextProps extends HighlighterProps, TextProps {
    hashtagStyle?: TextStyle;
    onHashtagPress?: (hashtag: string) => void;
    mentionStyle?: TextStyle;
    onMentionPress?: (mention: string) => void;
    emailStyle?: TextStyle;
    onEmailPress?: (email: string) => void;
    linkStyle?: TextStyle;
    onLinkPress?: (link: string) => void;
}

const HighlightedText = ({
    children,
    highlights = [],
    caseSensitive,
    hashtags,
    hashtagStyle = { color: 'blue' },
    onHashtagPress = () => {},
    mentions,
    mentionStyle = { color: 'blue' },
    onMentionPress = () => {},
    emails,
    emailStyle = { color: 'blue' },
    onEmailPress = () => {},
    links,
    linkStyle = { color: 'blue' },
    onLinkPress = () => {},
    ...props
}: HighlightTextProps) => {
    const text = React.Children.toArray(children)
        .filter(child => typeof child === 'string')
        .join('');

    return (
        <Text {...props}>
            {splitText({ text, highlights, caseSensitive, hashtags, mentions, emails, links }).map((chunk, index) => {
                if (
                    highlights.some(h =>
                        new RegExp(`^${h.regexSource.join('|')}$`, caseSensitive ? 'gm' : 'gmi').test(chunk),
                    )
                ) {
                    const highlight = highlights.find(h =>
                        new RegExp(`^${h.regexSource.join('|')}$`, caseSensitive ? 'gm' : 'gmi').test(chunk),
                    );
                    return (
                        <Text key={index} style={highlight?.style}>
                            {chunk}
                        </Text>
                    );
                }
                const handlers = [
                    [hashtags, hashtagRegexTester, hashtagStyle, onHashtagPress],
                    [mentions, mentionRegexTester, mentionStyle, onMentionPress],
                    [emails, emailRegexTester, emailStyle, onEmailPress],
                    [links, urlRegexTester, linkStyle, onLinkPress],
                ];
                for (const [enabled, regex, style, handler] of handlers) {
                    if (enabled && regex.test(chunk)) {
                        return (
                            <TouchableWithoutFeedback
                                accessibilityRole="button"
                                testID={`80ec1b88-30af-4288-adfc-5e92a60fb606-${index}`}
                                key={index}
                                onPress={() => handler(chunk)}>
                                <Text style={style}>{chunk}</Text>
                            </TouchableWithoutFeedback>
                        );
                    }
                }
                return <Text key={index}>{chunk}</Text>;
            })}
        </Text>
    );
};

export default HighlightedText;
