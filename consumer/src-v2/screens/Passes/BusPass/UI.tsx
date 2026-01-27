import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { BuyBusPassCard } from './components/BuyBusPassCard.tsx';
import { BuyBussPassOptionsSheet } from './components/BuyBussPassOptionsSheet.tsx';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import Animated from 'react-native-reanimated';
import { purchasedPassAPIEntity } from '@/readOnly/api/types/PurchasedPassAPIEntity.gen';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen.tsx';

interface BusPassUIProps {
    onBuyNow: () => void;
    passes?: passAPIEntity[];
    purchasedPasses?: purchasedPassAPIEntity[];
    isLoading: boolean;
    openDatePicker: boolean;
    onConfirmValidity: (data: { startDate: Date; endDate: Date }) => void;
    onConfirmPass: (selectedPass: passAPIEntity | undefined) => void;
    onModalDismiss?: () => void;
    offer: cumulativeOfferResp | undefined;
}

export const BusPassUI: React.FC<BusPassUIProps> = ({
    onBuyNow,
    passes,
    purchasedPasses,
    isLoading,
    onConfirmValidity,
    onConfirmPass,
    openDatePicker,
    onModalDismiss,
    offer,
}) => {
    return (
        <Animated.View style={tailwind.style('flex-1')}>
            <BuyBusPassCard onBuyNow={onBuyNow} offer={offer} />
            <BuyBussPassOptionsSheet
                passes={passes}
                purchasedPasses={purchasedPasses}
                onConfirm={onConfirmPass || (() => {})}
                isLoading={isLoading}
                isValidity={openDatePicker}
                handleConfirmValidity={onConfirmValidity || (() => {})}
                onDismiss={onModalDismiss}
            />
        </Animated.View>
    );
};
