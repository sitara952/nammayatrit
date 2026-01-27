/* eslint-disable myCustomPlugin/no-as-in-modified-files */

import React from 'react';
import { useStyles, createStyleSheet, useVariants } from './ComponentVariants';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface ListItemProps {
    state: (typeof ListItemVariants.state)[number];
    style: (typeof ListItemVariants.style)[number];
    showLeadingIcon?: boolean;
    showTrailingIcon?: boolean;
    leadingIcon?: React.ReactElement;
    trailingIcon?: React.ReactElement;
    title: string;
    /** Used to locate this view in end-to-end tests. */
    testID?: string;
}

export const ListItemVariants = {
    state: ['Default', 'Active', 'Disabled'] as const,
    style: ['Open', 'Boxed'] as const,
};

export function ListItem(props: ListItemProps) {
    const { state, style } = props;
    const { styles } = useStyles(stylesheet);
    useVariants(ListItemVariants, { state, style }, styles);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <View
            style={[
                styles['root'],
                state === 'Active'
                    ? {
                          ...styles['rootStateActiveStyleBoxed'],
                          borderColor: themeColors.Border_primraryHigh,
                          backgroundColor: themeColors.Fill_primaryMin,
                      }
                    : styles['rootStateDefaultStyleBoxed'],
            ]}
            testID={props.testID ?? '806:2148'}>
            {props.showLeadingIcon && props.leadingIcon}
            <Text
                // style={styles.option}
                testID="773:6067">
                {props.title}
            </Text>
            {props.showTrailingIcon && props.trailingIcon}
        </View>
    );
}

const stylesheet = createStyleSheet(_ => ({
    root: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingLeft: 16,
        paddingBottom: 12,
        width: '100%',
        paddingRight: 16,
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        backgroundColor: '#ffffff',
    } as ViewStyle,
    rootStateActiveStyleOpen: {},
    rootStateDisabledStyleOpen: {
        backgroundColor: 'unset' as ViewStyle['backgroundColor'],
    },
    rootStateDefaultStyleBoxed: {
        padding: 16,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e0e3e8',
    } as ViewStyle,
    rootStateActiveStyleBoxed: {
        padding: 16,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#306AFE',
        backgroundColor: '#F5F9FF',
    } as ViewStyle,
    rootStateDisabledStyleBoxed: {
        padding: 16,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e0e3e8',
    } as ViewStyle,
    option: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
        color: '#14171f',
        fontFamily: 'Area Normal',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 22,
        opacity: 0.8,
    } as TextStyle,
    optionStateDisabledStyleOpen: {
        color: '#b2b9c7',
    },
    optionStateDisabledStyleBoxed: {
        color: '#b2b9c7',
    },
}));
