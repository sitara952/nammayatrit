import { PickupInstructionsType } from '@/src-v2/utils/types';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PickupInstructionsUIProps = {
    instructions: PickupInstructionsType[];
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    handleButtonPress: () => void;
};
