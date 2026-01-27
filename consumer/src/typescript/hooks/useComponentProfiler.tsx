import { events } from '@/src-v2/systems/events/events';
import React from 'react';
import { Profiler } from 'react';

type PerformanceReport = {
    componentName: string;
    renderDuration: number;
};

type ProfilerWrapperProps = {
    componentName: string;
    children: React.ReactNode;
};

const report: Record<string, PerformanceReport> = {};

const onRender = (actualDuration: number, componentName: string) => {
    const existingReport = report[componentName];
    if (!existingReport) {
        const componentReport: PerformanceReport = {
            componentName,
            renderDuration: actualDuration,
        };
        /* eslint-disable functional/immutable-data */
        report[componentName] = componentReport;
        events.markScreenRender(componentName, actualDuration);
    }
};

const ProfilerWrapper = ({ componentName, children }: ProfilerWrapperProps) => {
    return (
        <Profiler
            id={componentName}
            onRender={(_: string, __: 'mount' | 'update' | 'nested-update', actualDuration: number) => {
                onRender(actualDuration, componentName);
            }}>
            {children}
        </Profiler>
    );
};

export { ProfilerWrapper as Profiler };
