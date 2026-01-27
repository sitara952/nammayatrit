import subwayTransit from '@/src-v2/assets/3D-assets/full-asset/suburban_transit.webp';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { TransitCost } from '../../../JourneyInfoScreen/components/TransitCost';
import { getColor, getIcon } from '../../../NewLiveJourney/utils/getIternaryUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type SuburbanInfoCardProps = {
    trainType: string;
    trainClass: string;
    cost: number;
    date: string;
    utsNumber: string;
    time: string;
    phoneNumber: string;
    fromStation: {
        english: string;
        hindi: string;
        tamil: string;
    };
    toStation: {
        english: string;
        hindi: string;
        tamil: string;
    };
    viaRoute: string;
    commencingHours: number;
};

export default function SuburbanInfoCard({
    trainType = 'NA',
    trainClass = 'NA',
    cost = 0,
    date = 'NA',
    utsNumber = 'NA',
    phoneNumber = 'NA',
    time = 'NA',
    fromStation = {
        english: 'NA',
        hindi: 'NA',
        tamil: 'NA',
    },
    toStation = {
        english: 'NA',
        hindi: 'NA',
        tamil: 'NA',
    },
    viaRoute = 'NA',
}: SuburbanInfoCardProps) {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const textClass = 'text-[12px] font-areaNormal-semibold text-[#2F2F2F] leading-[13px]';

    const getTrainClass = () => {
        switch (trainClass) {
            case 'First Class':
                return userLanguageStrings.FirstClassFC;
            case 'Second Class':
                return userLanguageStrings.SecondClassII;
            default:
                return trainClass;
        }
    };

    const getTrainType = () => {
        switch (trainType) {
            case 'O':
                return userLanguageStrings.OrdinaryO;
            default:
                return trainType;
        }
    };

    return (
        <>
            <Animated.View
                style={tailwind.style(
                    'bg-white border border-[#F1F2F2] rounded-[16px] mx-[20px] mt-[20px] py-[16px] px-[20px] overflow-hidden relative',
                )}>
                <Animated.View>
                    <View style={tailwind.style('flex-row items-center pb-4')}>
                        <TransitCost
                            rupeeColor="#3B3A3C"
                            numberColor="#3B3A3C"
                            textSize="text-[32px] max-h-[32px] leading-[36px]"
                            cost={cost}
                        />
                    </View>
                    <View style={tailwind.style('flex-row items-center')}>
                        <View
                            style={tailwind.style(
                                'h-[20px] w-[20px] rounded-[7px] justify-center items-center',
                                `bg-[${getColor('SUBWAY', undefined)}]`,
                            )}>
                            {getIcon('SUBWAY', 11, undefined, undefined, undefined)}
                        </View>
                        <Text
                            style={tailwind.style(
                                'font-areaNormal-extrabold text-[14px] max-h-[22px] leading-[22px] tracking-[0.3px] text-[#313131] pl-2.5 capitalize',
                            )}>
                            {userLanguageStrings.LocalTrain}
                        </Text>
                        <Text
                            style={tailwind.style(
                                'text-[14px] font-departureMono-regular text-[#7E7E7E] max-h-[22px] leading-[22px] tracking-[0.2px] pl-0.5',
                            )}>
                            {'|'}
                            {trainClass}
                        </Text>
                    </View>
                </Animated.View>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="suburban transit image"
                    style={[
                        tailwind.style('absolute -right-[190px] h-[290px] w-[290px] top-[-120px]'),
                        { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="cover"
                    source={subwayTransit}
                />
            </Animated.View>
            <Animated.View style={tailwind.style('px-[17px] pt-[16px]')}>
                <Animated.View style={tailwind.style('rounded-[14px] bg-[#F8F965] p-[16px]')}>
                    <Animated.Text style={tailwind.style(textClass, 'text-center')}>
                        {userLanguageStrings.Journey}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('h-[1px] mt-[13px] bg-[#D3D456] w-full')} />
                    <Animated.View style={tailwind.style('pt-[14px]')}>
                        <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                            <Animated.Text style={tailwind.style(textClass)}>₹ {cost}/-</Animated.Text>
                            <Animated.Text style={tailwind.style(textClass)}>
                                {date} {time}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center justify-between pt-[10px]')}>
                            <Animated.Text style={tailwind.style(textClass, 'max-w-[50%]')} numberOfLines={1}>
                                {userLanguageStrings.UTSNo}: {utsNumber}
                            </Animated.Text>
                            <Animated.Text style={tailwind.style(textClass, 'max-w-[50%]')} numberOfLines={1}>
                                {phoneNumber}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style('pt-[8px] flex-row items-center justify-between')}></Animated.View>
                </Animated.View>
                <Animated.View style={tailwind.style('pt-[12px] pb-[18px] px-[20px] bg-[#F7F7F7] rounded-[14px]')}>
                    <Animated.View
                        style={tailwind.style('flex-row items-center gap-[6px] pb-[13px] border-b border-[#D9D9D9]')}>
                        <Animated.View
                            style={tailwind.style(
                                'h-[23px] w-[23px] rounded-full justify-center items-center',
                                `bg-[${getColor('SUBWAY', undefined)}]`,
                            )}>
                            {getIcon('SUBWAY', 14, undefined, undefined, undefined)}
                        </Animated.View>
                        <Animated.Text style={tailwind.style(textClass, 'leading-[14px]')}>
                            {userLanguageStrings.TrainTicket}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            'py-[20px] border-b border-[#D9D9D9] flex-row items-center justify-between',
                        )}>
                        <Animated.View style={tailwind.style('max-w-[50%]')}>
                            <Animated.Text style={tailwind.style(textClass, 'text-[#81838B]')}>
                                {userLanguageStrings.SourceStation}
                            </Animated.Text>
                            <Animated.View style={tailwind.style('pt-[12px]')}>
                                <Animated.Text style={tailwind.style(textClass, 'leading-[17px]')} numberOfLines={1}>
                                    {fromStation.hindi}
                                </Animated.Text>
                                <Animated.Text style={tailwind.style(textClass, 'leading-[17px]')} numberOfLines={1}>
                                    {fromStation.english}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(textClass, 'leading-[17px] pt-[4px]')}
                                    numberOfLines={1}>
                                    {fromStation.tamil}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                        <Animated.View style={tailwind.style('max-w-[50%]')}>
                            <Animated.Text style={tailwind.style(textClass, 'text-[#81838B] text-right')}>
                                {userLanguageStrings.Destination}
                            </Animated.Text>
                            <Animated.View style={tailwind.style('pt-[12px]')}>
                                <Animated.Text
                                    style={tailwind.style(textClass, 'leading-[17px]  text-right')}
                                    numberOfLines={1}>
                                    {toStation.hindi}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(textClass, 'leading-[17px]  text-right')}
                                    numberOfLines={1}>
                                    {toStation.english}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(textClass, 'leading-[17px] pt-[4px] text-right')}
                                    numberOfLines={1}>
                                    {toStation.tamil}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    {viaRoute.trim().length > 0 ? (
                        <Animated.View
                            style={tailwind.style(
                                'py-[14px] border-b border-[#D9D9D9] flex-row items-center justify-between',
                            )}>
                            <Animated.Text style={tailwind.style(textClass, 'leading-[14px]')}>
                                {`${userLanguageStrings.Via} ${viaRoute}`}
                            </Animated.Text>
                        </Animated.View>
                    ) : null}

                    <Animated.View style={tailwind.style('pt-[14px]')}>
                        <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                            <Animated.Text style={tailwind.style(textClass, 'leading-[14px]')}>
                                {getTrainClass()}
                            </Animated.Text>
                            <Animated.Text style={tailwind.style(textClass, 'leading-[14px]')}>
                                {getTrainType()}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </>
    );
}
