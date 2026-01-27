import Animated from 'react-native-reanimated';
import ConfirmButton from '../../Favourites/components/ConfirmButton';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { BackButton } from '@/src-v2/multimodal/components/common/BackButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const LocateOnMapDirectBusBooking = ({
    onClose,
    stopName = 'NA',
    address = 'NA',
}: {
    onClose: () => void;
    stopName: string;
    address: string;
}) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('px-4')}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between pb-4  pt-4')}>
                <BackButton onPress={onClose} />
                <Animated.Text style={tailwind.style('text-[15px] font-areaNormal-extrabold  text-[#3B3A3C]')}>
                    {userLanguageStrings.EditLocation}
                </Animated.Text>

                <Animated.View style={tailwind.style('w-[24px] h-[20px]')} />
            </Animated.View>
            <Animated.View
                style={tailwind.style(
                    `rounded-[20px] border border-[${colors.CrossButton_bg}] bg-white  px-4 py-[13px] mb-[20px]`,
                )}>
                <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold  text-[#3B3A3C]')}>
                    {stopName}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style('text-[14px] font-areaNormal-bold  text-[#656565] pt-[8px]')}
                    numberOfLines={1}>
                    → {address}
                </Animated.Text>
            </Animated.View>
            <ConfirmButton onPress={() => {}} text={userLanguageStrings.Confirm} disabled={false} />
        </Animated.View>
    );
};

export default LocateOnMapDirectBusBooking;
