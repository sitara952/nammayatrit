import React, { useState } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { setAppName } from '../state/client/session';
import CustomReanimatedImage from '../components/common/CustomAnimatedImage';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAppDispatch } from '../state/hooks';
import { tailwind } from '../tailwindTheme/tailwind';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { appName } from '../../../../libs/config-types/dist/domain/factors/appName';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const ChooseTheme = () => {
    // State to manage the selected item
    const [selectedItem] = useState(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    // Sample data for the list
    const data: ThemeItem[] = [
        {
            id: 'nammaYatri',
            name: 'Namma yatri',
            img: 'https://media.licdn.com/dms/image/v2/C4E0BAQGvInbo7XWjdQ/company-logo_200_200/company-logo_200_200/0/1672669601769/nammayatri_logo?e=2147483647&v=beta&t=-QqALBJyWT9KYZLS_dRZH_Ktcx0uugJ8MTPV_ofBXvc',
        },
        {
            id: 'odishaYatri',
            name: 'Odisa yatri',
            img: 'https://play-lh.googleusercontent.com/uk-ZGUfWrLLc-SmIJlERSIGa2g7p-oLHm2Jc6ko3GEkOokSXG5Rw-p9Iqoucy4Corg',
        },
        {
            id: 'yatriSathi',
            name: 'Yatri Sathi',
            img: 'https://play-lh.googleusercontent.com/YCVmcSHlGGjKPjlmBE_vU4U6zWSG55lllT5dYNnHu1uT8APBxFK-7jSGVUW74p8jXiE',
        },
        {
            id: 'yatri',
            name: 'Yatri',
            img: 'https://media.licdn.com/dms/image/v2/C4E0BAQGvInbo7XWjdQ/company-logo_200_200/company-logo_200_200/0/1672669601769/nammayatri_logo?e=2147483647&v=beta&t=-QqALBJyWT9KYZLS_dRZH_Ktcx0uugJ8MTPV_ofBXvc',
        },
        {
            id: 'bridge',
            name: 'Bridge',
            img: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
        },
    ];

    const dispatch = useAppDispatch();
    // Function to handle selection
    const handleSelect = (id: appName) => {
        dispatch(setAppName(id)); // Update selected item ID
        navigation.goBack();
    };

    interface ThemeItem {
        id: appName;
        name: string;
        img: string;
    }

    // Render a single item
    const renderItem = ({ item }: { item: ThemeItem }) => {
        const isSelected = item.id === selectedItem; // Check if the item is selected
        return (
            <TouchableOpacity
                accessibilityRole="button"
                testID={`app_theme_change_${item.id}`}
                style={[styles.item, isSelected && styles.selectedItem]}
                onPress={() => handleSelect(item.id)}>
                <CustomReanimatedImage
                    source={{ uri: item.img }}
                    cacheKey={item.name}
                    resizeMode="contain"
                    style={tailwind.style('h-16 w-16 flex-initial rounded-2xl')}
                />
                <Text style={[styles.text, isSelected && styles.selectedText]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                extraData={selectedItem} // Rerender list when selection changes
            />
        </View>
    );
};

const styles = StyleSheet.create({
    imageSize: {
        height: 10,
        width: 20,
    },
    container: {
        flex: 1,
        padding: 16,
        marginTop: 100,
        backgroundColor: '#f5f5f5',
    },
    item: {
        padding: 16,
        marginVertical: 8,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedItem: {
        backgroundColor: '#007BFF', // Highlight color for the selected item
        borderColor: '#0056b3',
    },
    text: {
        flex: 1,
        margin: 'auto',
        marginLeft: 25,
        fontSize: 16,
        color: '#333',
    },
    selectedText: {
        color: '#fff', // Text color for the selected item
    },
});

export default ChooseTheme;
