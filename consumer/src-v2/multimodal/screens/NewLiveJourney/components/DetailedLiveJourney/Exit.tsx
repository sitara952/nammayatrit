import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import Button from '@/src-v2/primitives/Button';
import { Platform } from 'react-native';
import { ChevronDown } from '@/src-v2/assets/svg/ChevronArrows';

export const ExitButton = ({ onPressExit }: { onPressExit: () => void }) => {
    return (
        <Button
            testID="exit-button"
            key="maps"
            size="md"
            type="secondary"
            accessible={true}
            accessibilityRole={'button'}
            accessibilityLabel="Exit screen"
            onPress={onPressExit}
            style={[{ paddingVertical: 0, borderRadius: 50, borderWidth: 0, paddingTop: 2 }, styles.buttonShadow]}>
            <Icon icon={<ChevronDown />} size={18} color={'#3B3A3C'} />
        </Button>
    );
};

const styles = {
    buttonShadow: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
};
