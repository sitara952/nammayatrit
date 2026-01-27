import { ViewProps } from 'react-native';

export interface HeaderCardProps extends ViewProps {
    icon: React.ReactElement;
    onPress: () => void;
    text: string;
}

export interface SideBarCellProps extends ViewProps {
    onPress: () => void;
    icon: React.ReactElement;
    text: string;
}

export interface SideBarListProps extends ViewProps {
    list: SideBarCellProps[];
}
