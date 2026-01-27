import { Icon } from '../common/Icon';
import { View } from 'react-native';
import { MetroIconAlternate, MetroIconAlternateGreen } from '../svg/transport/MetroIcon';
import { LeavesIcon } from '../svg/transport/MetroIcon';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppName } from '@/typescript/state/client/session';

export const MetroConditionalIcon = ({
    color,
    size,
    noLeaf,
}: {
    color: string;
    size: number;
    noLeaf: boolean | undefined;
}) => {
    const appname = useAppSelector(selectAppName);
    if (appname === 'nammaYatri')
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon color={color} icon={<MetroIconAlternateGreen fill={undefined} />} size={size} />
                {!noLeaf && <Icon color="#14A255" icon={<LeavesIcon fill={undefined} />} size={size} />}
            </View>
        );
    else {
        return <Icon color={color} icon={<MetroIconAlternate fill={undefined} />} size={size} />;
    }
};
