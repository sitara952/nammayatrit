import type { Highlight } from './Highlight';
import {
    mentionRegex,
    mentionRegexTester,
    hashtagRegex,
    hashtagRegexTester,
    emailRegex,
    emailRegexTester,
    urlRegex,
    urlRegexTester,
} from './regexes';

export interface HighlighterProps {
    text?: string;
    highlights?: Highlight[];
    caseSensitive?: boolean;
    hashtags?: boolean;
    mentions?: boolean;
    emails?: boolean;
    links?: boolean;
}

interface HtmlProps extends HighlighterProps {
    hashtagClassName?: string;
    hashtagUrl?: (hashtag: string) => string;
    mentionClassName?: string;
    mentionUrl?: (mention: string) => string;
    emailClassName?: string;
    emailUrl?: (email: string) => string;
    linkClassName?: string;
}

export const splitText = ({
    text = '',
    highlights = [],
    caseSensitive,
    hashtags,
    mentions,
    emails,
    links,
}: HighlighterProps) => {
    const regexPatterns = [
        ...highlights.flatMap(h => h.regexSource),
        hashtags && hashtagRegex.source,
        mentions && mentionRegex.source,
        emails && emailRegex.source,
        links && urlRegex.source,
    ].filter(Boolean);

    return text ? text.split(new RegExp(regexPatterns.join('|'), caseSensitive ? 'gm' : 'gmi')).filter(Boolean) : [];
};

export const formatedHtml = (props: HtmlProps) => {
    const {
        highlights,
        caseSensitive,
        hashtags,
        mentions,
        emails,
        links,
        hashtagClassName,
        hashtagUrl,
        mentionClassName,
        mentionUrl,
        emailClassName,
        emailUrl,
        linkClassName,
    } = props;
    return splitText(props)
        .map(chunk => {
            for (const highlight of highlights || []) {
                if (new RegExp(`^${highlight.regexSource.join('|')}$`, caseSensitive ? 'gm' : 'gmi').test(chunk)) {
                    return `<span class=${highlight.className}>${chunk}</span>`;
                }
            }
            if (hashtags && hashtagRegexTester.test(chunk))
                return `<a class=${hashtagClassName || ''} href=${hashtagUrl?.(chunk) || '#'}>${chunk}</a>`;
            if (mentions && mentionRegexTester.test(chunk))
                return `<a class=${mentionClassName || ''} href=${mentionUrl?.(chunk) || '#'}>${chunk}</a>`;
            if (emails && emailRegexTester.test(chunk))
                return `<a class=${emailClassName || ''} href=${emailUrl?.(chunk) || 'mailto:' + chunk}>${chunk}</a>`;
            if (links && urlRegexTester.test(chunk))
                return `<a class=${linkClassName || ''} href=${chunk}>${chunk}</a>`;
            return `<span>${chunk}</span>`;
        })
        .join('');
};
