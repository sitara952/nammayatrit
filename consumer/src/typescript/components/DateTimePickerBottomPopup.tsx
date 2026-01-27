import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { useConfigContext } from '../context/ConfigContext';
import { PopUpModal } from './PopUpModal';
import DatePicker from 'react-native-date-picker';
import Button from '@/src-v2/primitives/Button';

type DateTimePickerBottomPopupProps = {
    dateTime: Date;
    setDateTime: (newDate: Date) => void;
    maxPossibleDate: Date;
    minPossibleDate: Date;
    estimatedDuration: number | undefined;
    dateTimePickerBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
};

const DateTimePickerBottomPopup: React.FC<DateTimePickerBottomPopupProps> = ({
    dateTime,
    setDateTime,
    maxPossibleDate,
    minPossibleDate,
    dateTimePickerBottomSheetModalRef,
}) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [currSelectedDate, setCurrSelectedDate] = useState(new Date());
    const [isSpinning, setIsSpinning] = useState(false);

    const onButtonPress = () => {
        setDateTime(currSelectedDate);
        dateTimePickerBottomSheetModalRef?.current?.close();
    };
    return (
        <PopUpModal
            sheetRef={dateTimePickerBottomSheetModalRef}
            enableDynamicSizing={true}
            onHardwareBackPress={undefined}
            showBackdrop={undefined}
            isScrollable={false}>
            <View style={[styles.container, { paddingBottom: bottom }]}>
                <DatePicker
                    date={dateTime}
                    onDateChange={setCurrSelectedDate}
                    maximumDate={maxPossibleDate}
                    minimumDate={minPossibleDate}
                    onStateChange={state => setIsSpinning(state === 'spinning')}
                    theme="light"
                />
                <Button
                    testID="date_picker_date_time_set"
                    type="primary"
                    text={userLanguageStrings.Done}
                    onPress={onButtonPress}
                    disabled={isSpinning}
                />
            </View>
        </PopUpModal>
    );
};

export default DateTimePickerBottomPopup;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 40,
    },
});
