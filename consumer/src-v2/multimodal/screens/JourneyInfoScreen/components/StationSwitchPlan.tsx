/* eslint-disable functional/immutable-data */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon.tsx';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { JourneyRouteTypes } from '../../Ticket/SingleTicket/components/SuburbanSwitchRoute';
import { ShuffleHorizontal } from '@/src-v2/multimodal/components/svg/ShuffleHorizontal';
import { MetroExit } from '@/src-v2/multimodal/components/svg/MetroExit';
import { createLineStationMapping } from '@/typescript/utils/MultiModal';
import { getMetroLineColorHex } from '../../LiveTicket/Tickets/TicketUtils';
import TrainIcon from '@/src-v2/assets/svg/Train';

type StationSwitchPlanProps = {
    journeyRoutes: Array<JourneyRouteTypes>;
};

type Stage = {
    type: 'journey-start' | 'switch' | 'journey-end';
    icon: React.ReactElement;
    actionText: string | undefined;
    stationName: string | undefined;
    iconBg: string;
    lineInfo: string | undefined;
    lineColor: string | undefined;
    towardsStation: string | undefined;
    allTowardsStations: string[] | undefined;
    switchMapping: Array<{ line: string; station: string }> | undefined;
};

const StationSwitchPlan: React.FC<StationSwitchPlanProps> = ({ journeyRoutes }) => {
    // Create stages based on the logic: start + switches + end
    const createStages = () => {
        const stages: Stage[] = [];

        if (journeyRoutes.length === 0) return stages;

        // Start stage: sourceStation of first element
        stages.push({
            type: 'journey-start',
            icon: <TrainIcon fill="#4CAF50" />,
            actionText: 'Take Metro at',
            stationName: journeyRoutes[0]?.sourceStation,
            iconBg: '#4CAF50',
            towardsStation: journeyRoutes[0]?.towardsStation,
            allTowardsStations: journeyRoutes[0]?.allTowardsStations,
            lineInfo: undefined,
            lineColor: undefined,
            switchMapping: undefined,
        });

        // Switch stages: destinationStation of first and middle elements (skip 0th index as it's used for journey-start)
        journeyRoutes.forEach((route, routeIndex) => {
            if (route.type === 'SWITCH_STATION_START_JOURNEY') {
                // Create mapping for this switch stage - start from index 1 since 0 is used for journey-start
                const switchIndex = routeIndex + 1;
                const routeLineColor =
                    Array.isArray(route.lineColor) && route.lineColor[switchIndex]
                        ? [route.lineColor[switchIndex]]
                        : [];

                // Get the specific station for this switch using switchIndex
                const towardsStationForSwitch = route.allTowardsStations?.[switchIndex];
                const switchMapping = createLineStationMapping(
                    routeLineColor,
                    towardsStationForSwitch ? [towardsStationForSwitch] : [],
                );

                stages.push({
                    type: 'switch',
                    icon: <ShuffleHorizontal />,
                    actionText: undefined,
                    lineInfo: 'Purple line towards Whitfield at',
                    stationName: route.destinationStation,
                    iconBg: '#9E9E9E',
                    lineColor: stages.length === 1 ? '#9C27B0' : '#4CAF50',
                    towardsStation: route.towardsStation,
                    allTowardsStations: route.allTowardsStations,
                    switchMapping: switchMapping,
                });
            }
        });

        // End stage: destinationStation of last element
        stages.push({
            type: 'journey-end',
            icon: <Icon icon={<MetroExit />} size={40} color="#016ACD" />,
            actionText: 'Exit at',
            stationName: journeyRoutes[journeyRoutes.length - 1]?.destinationStation,
            iconBg: '#2196F3',
            towardsStation: journeyRoutes[journeyRoutes.length - 1]?.towardsStation,
            allTowardsStations: journeyRoutes[journeyRoutes.length - 1]?.allTowardsStations,
            lineInfo: undefined,
            lineColor: undefined,
            switchMapping: undefined,
        });

        return stages;
    };

    const stages = createStages();

    const renderStage = (stage: Stage, index: number) => {
        const isLast = index === stages.length - 1;

        return (
            <Animated.View key={index} style={{ position: 'relative' }}>
                {/* Circular Dot on Vertical Line */}
                <Animated.View style={styles.stageDot} />

                {/* Stage Content */}
                <Animated.View style={styles.stageContent}>
                    {/* Icon positioned above text */}
                    <Icon icon={stage.icon} size={18} color={stage.iconBg} />
                    {/* Text Content below icon */}
                    <Animated.View style={styles.textContainer}>
                        {/* Action Text and Switch Instruction */}
                        {stage.type === 'switch' && stage.switchMapping && stage.switchMapping.length > 0 ? (
                            <Animated.View style={styles.switchInstructionContainer}>
                                {stage.switchMapping.map((mapping, mappingIndex) => (
                                    <Animated.View key={mappingIndex} style={styles.switchInstructionItem}>
                                        <Typography
                                            type="body-3"
                                            style={styles.actionText}
                                            numberOfLines={1}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel="Switch to"
                                            accessibilityRole={undefined}>
                                            Switch to
                                        </Typography>
                                        <Animated.View
                                            style={[
                                                styles.metroIcon,
                                                {
                                                    backgroundColor: getMetroLineColorHex(
                                                        mapping?.line?.toLowerCase() || '',
                                                    ),
                                                },
                                            ]}>
                                            <Typography
                                                type="body-3"
                                                style={styles.metroIconText}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={true}
                                                accessibilityLabel="Metro"
                                                accessibilityRole={undefined}>
                                                M
                                            </Typography>
                                        </Animated.View>
                                        <Typography
                                            type="body-3"
                                            style={[styles.actionText, { width: '80%' }]}
                                            numberOfLines={1}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel={`${mapping?.line} line towards ${mapping?.station} at`}
                                            accessibilityRole={undefined}>
                                            {mapping?.line} line towards {mapping?.station} at
                                        </Typography>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        ) : (
                            <Typography
                                type="body-3"
                                style={[styles.actionText, !stage.actionText && styles.actionTextHidden]}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={stage.actionText}
                                accessibilityRole={undefined}>
                                {stage.actionText}
                            </Typography>
                        )}

                        {/* Station Name */}
                        <Typography
                            type="body-1"
                            style={styles.stationName}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={stage.stationName}
                            accessibilityRole={undefined}>
                            {stage.stationName}
                        </Typography>
                    </Animated.View>
                </Animated.View>

                {/* Horizontal Separator Line */}
                {!isLast && <Animated.View style={styles.separator} />}
            </Animated.View>
        );
    };

    return (
        <Animated.View style={styles.container}>
            {/* Header */}
            <Animated.View style={styles.header}>
                <Typography
                    type="subhead-1"
                    style={styles.headerTitle}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Your Station Switch Plan"
                    accessibilityRole={undefined}>
                    Your Station Switch Plan
                </Typography>
            </Animated.View>

            {/* Timeline Container */}
            <Animated.View style={styles.timelineContainer}>
                {/* Main Vertical Line - Continuous bar with rounded ends */}
                <Animated.View style={[styles.verticalLine, { height: stages.length * 95 + 60 }]} />

                {/* Stages */}
                <Animated.View style={styles.stagesContainer}>
                    {stages.map((stage, index) => renderStage(stage, index))}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default StationSwitchPlan;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '800',
        color: '#3B3A3C',
        marginBottom: 4,
    },
    timelineContainer: {
        flexDirection: 'row',
    },
    verticalLine: {
        marginTop: 0,
        width: 20,
        backgroundColor: '#EFEFEF',
        borderRadius: 7,
    },
    stageDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        marginTop: 4,
        borderRadius: 6,
        backgroundColor: '#C9C9C9',
        left: -16,
        top: 0,
    },
    stagesContainer: {
        flexDirection: 'column',
        gap: 24,
    },
    stageContent: {
        marginLeft: 16,
        paddingBottom: 16,
    },
    textContainer: {
        // No specific styles needed
    },
    actionText: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '800',
        color: '#9E9E9E',
        marginBottom: 4,
        marginTop: 4,
    },
    actionTextHidden: {
        display: 'none',
    },
    stationName: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '700',
        color: '#212121',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginLeft: 16,
        marginBottom: 16,
    },
    switchInstructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    switchInstructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
    },
    metroIcon: {
        width: 15,
        height: 14,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    metroIconText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
        lineHeight: 10,
    },
});
