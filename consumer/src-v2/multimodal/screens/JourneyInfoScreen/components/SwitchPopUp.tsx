import Animated from 'react-native-reanimated';
import React from 'react';
import { createAction } from '@/typescript/utils/common';
import { JourneyDetailScreenAction } from '../Types';
import { Resolver } from '@/typescript/utils/common';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { GenericList } from '@/src-v2/multimodal/components/common/GenericList';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WalkIcon } from '../../../components/svg/transport/WalkIcon';
import { CarIcon } from '../../../components/svg/transport/CarIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type SwitchPopUpProps = {
    mpDispatch: Resolver<JourneyDetailScreenAction>;
    selectedMultimodalLeg: legInfo | undefined;
};

const SwitchPopUp = (props: SwitchPopUpProps) => {
    const { mpDispatch, selectedMultimodalLeg } = props;
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('mt-8', `mb-[${bottom + 12}]`)}>
            <GenericList
                sectionTitle={userLanguageStrings.RideOptions}
                list={[
                    {
                        hasChevron: true,
                        title: userLanguageStrings.ChangeVehicle,
                        icon: <CarIcon fill={undefined} />,
                        onPressListItem: () =>
                            mpDispatch(createAction('CHANGE_VEHICLE', { legOrder: selectedMultimodalLeg?.order })),
                    },
                    {
                        hasChevron: true,
                        title: userLanguageStrings.SwitchtoWalk,
                        icon: <WalkIcon />,

                        onPressListItem: () => {
                            if (selectedMultimodalLeg) {
                                mpDispatch(
                                    createAction<
                                        'SWITCH_MODE',
                                        { legOrder: number; newMode: MultimodalTravelMode_multimodalTravelMode }
                                    >('SWITCH_MODE', { legOrder: selectedMultimodalLeg.order, newMode: 'Walk' }),
                                );
                            } else {
                                console.error('No selected leg');
                            }
                        },
                    },
                ]}
            />
        </Animated.View>
    );
};

export default SwitchPopUp;
