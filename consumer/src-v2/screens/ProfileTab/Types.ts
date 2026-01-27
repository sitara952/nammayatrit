import React from 'react';

export interface ProfileOptionProps {
    icon: React.ReactNode;
    text: string;
    onPress: () => void;
    isLastItem?: boolean;
    tagText?: string;
    showTag?: boolean;
    verificationIcon?: React.ReactNode;
}

export interface ProfileHeaderProps {
    fullName: string;
    email: string | undefined;
    profilePicture: string | undefined;
    onViewProfilePress: () => void;
}

export interface ProfileTabProps {
    primaryOptions: ProfileOptionProps[];
    secondaryOptions: ProfileOptionProps[];
    tertiaryOptions: ProfileOptionProps[];
    fullName: string;
    email: string | undefined;
    profilePicture: string | undefined;
    onViewProfilePress: () => void;
    isBusinessProfileModalVisible: boolean;
    setIsBusinessProfileModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
