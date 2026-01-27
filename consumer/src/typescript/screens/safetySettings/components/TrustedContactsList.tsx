import React from 'react';
import { View } from 'react-native';
import TrustedContactDetail from './TrustedContactDetail';
import { TrustedContactsListProps } from '../rules/schema';
import { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const TrustedContactsList: React.FC<TrustedContactsListProps> = ({ contacts, options, onDelete, onOptionSelect }) => {
    // Create unique refs for each contact
    const contactRefs = useRef<{ [key: string]: React.RefObject<BottomSheetModal | null> }>({});

    return (
        <View>
            {contacts.map(c => {
                // Create a unique ref for this contact if it doesn't exist
                if (!contactRefs.current[c.id]) {
                    contactRefs.current[c.id] = React.createRef<BottomSheetModal | null>();
                }

                return (
                    <View key={c.id}>
                        <TrustedContactDetail
                            contactName={c.name}
                            mobileNumber={c.phone}
                            avatarInitials={c.initials}
                            avatarColor={c.color}
                            sheetRef={contactRefs.current[c.id] || React.createRef<BottomSheetModal>()}
                            onDelete={onDelete}
                            selectedOption={c.selectedOption || 'ALWAYS_SHARE'}
                            onOptionSelect={option => onOptionSelect(c.id, option)}
                            options={options}
                        />
                    </View>
                );
            })}
        </View>
    );
};

export default React.memo(TrustedContactsList);
