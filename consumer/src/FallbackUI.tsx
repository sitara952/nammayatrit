// eslint-disable-next-line no-restricted-imports
import { View, Text, NativeModules, Platform, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Refresh from './typescript/components/svg/Refresh.tsx';

const { AppInfoModule } = NativeModules;

export const FallbackUI = ({ error }: { error: unknown }) => {
    return (
        <View style={{ height: '100%', width: '100%', backgroundColor: '#FFFFFF' }}>
            <View style={{ margin: 'auto', alignItems: 'center', gap: 24 }}>
                <Text
                    style={{
                        fontWeight: 'bold',
                        marginHorizontal: 70,
                        textAlign: 'center',
                        fontSize: 24,
                        color: '#1E1E1E',
                    }}>
                    encountered an unexpected issue
                </Text>
                <ScrollView style={{ height: '50%' }}>
                    <View
                        style={{
                            height: '100%',
                            width: '100%',
                            justifyContent: 'center',
                            alignContent: 'center',
                            padding: 16,
                        }}>
                        <View style={{ margin: 'auto', gap: 8 }}>
                            <Text>{error instanceof Error ? error.name : 'Unknown Error'}</Text>
                            <Text>{error instanceof Error ? error.message : String(error)}</Text>
                            <Text>{error instanceof Error ? JSON.stringify(error.cause) : 'No cause'}</Text>
                            <Text>{error instanceof Error ? error.stack : 'No stack trace'}</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                    {Platform.OS === 'android' && (
                        <TouchableWithoutFeedback
                            accessibilityRole="button"
                            onPress={() => {
                                AppInfoModule.restartApp();
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    backgroundColor: '#F0F0F0',
                                    gap: 8,
                                    borderRadius: 16,
                                    width: 138,
                                    height: 48,
                                    paddingVertical: 3,
                                    paddingHorizontal: 6,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Refresh fill={undefined} />
                                <Text
                                    style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 16, color: '#1E1E1E' }}>
                                    Refresh
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    {Platform.OS === 'ios' && (
                        <Text
                            style={{
                                fontWeight: 600,
                                marginHorizontal: 70,
                                textAlign: 'center',
                                fontSize: 16,
                                color: '#1E1E1E',
                            }}>
                            Please re-start the app
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};
