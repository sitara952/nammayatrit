import { View, Image } from 'react-native';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { tailwind } from '../tailwindTheme/tailwind';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import { useRefsContext } from '../context/RefsContext';
import { map } from 'lodash';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '../state/hooks.ts';

import { useConfigContext } from '../context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const RentalPolicy = () => {
    const { bottom } = useSafeAreaInsets();
    const { rentalPolicyModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const closeClick = () => {
        rentalPolicyModalRef.current?.close();
    };
    const appConfig = useAppSelector(selectAppConfig);
    return (
        <View style={tailwind.style(`mt-[24px] mb-[${bottom}px] mx-[16px]`)}>
            <View style={tailwind.style(`flex-row justify-between items-center mb-[10px]`)}>
                <Typography
                    type="subhead-800"
                    style={tailwind.style(`text-[#14171F]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.RentalPolicy}
                </Typography>
                <View style={tailwind.style(`flex-1`)} />
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="rental_policy_close"
                    style={tailwind.style(`py-3 px-4 bg-white border border-[#E0E3E8] rounded-full`)}
                    onPress={closeClick}>
                    <CloseIcon color={undefined} height={undefined} width={undefined} />
                </TouchableOpacity>
            </View>
            {map([userLanguageStrings.RentalPolicyDesc1, userLanguageStrings.RentalPolicyDesc2], item => (
                <View style={tailwind.style(`mt-[10px] flex-row`)}>
                    <View style={tailwind.style(`w-1.5 h-1.5 bg-black rounded-full mr-2 mt-2`)}></View>
                    <Typography
                        type="subhead-800"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {item}
                    </Typography>
                </View>
            ))}

            <Image
                accessible={true}
                accessibilityLabel="rental policy image"
                source={{ uri: appConfig.assets.rentalPolicyImageUri }}
                style={tailwind.style(`mt-[24px] w-[100%] h-[136px] rounded-xl`)}
            />

            <Typography
                type="subhead-800"
                style={tailwind.style(`mt-[20px]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.RentalPolicyDesc3}
            </Typography>

            <Button
                testID="rental_policy_got_it"
                type="primary"
                text={userLanguageStrings.GotIt}
                textColor="#ffffff"
                style={tailwind.style('text-[#5B6777] mt-[24px] justify-center')}
                onPress={closeClick}
            />
        </View>
    );
};

export default RentalPolicy;
