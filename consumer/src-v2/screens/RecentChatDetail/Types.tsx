import { taggedChatMessage } from '@/readOnly/api/types/TaggedChatMessage.gen';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RecentChatDetailUIProps = {
    rideId: string | undefined;
    ticketId: string | undefined;
    chatMessages: taggedChatMessage[];
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
};
