/* eslint-disable functional/immutable-data */

import { VehicleVariant_vehicleVariant } from '@/readOnly/api/types/Enums.gen';
import { publicTransportInfo } from '@/readOnly/api/types/PublicTransportInfo.gen';
import { NearbyDriversConfig } from '@/src-v2/systems/configs/types';
import { nearbyDriverRes } from '@/typescript/state/server/nearbyDriversApi.ts';
import { nearByDriversBucket } from '@/typescript/state/server/nearbyDriversApi.ts';
import { driverInfo } from '@/typescript/state/server/nearbyDriversApi.ts';

/**
 * Filters nearby drivers based on specific distribution criteria:
 * - closeRangeDriversPercent% of the selected drivers should be within or near the lowest radius
 * - The rest of the selected drivers from other rings
 * - Drivers should be distributed between AUTO category and CAB category based on autoCategorySplitPercent
 *
 * @param nearbyDrivers The nearby drivers data structure
 * @param limit The maximum number of drivers to return
 * @param config Optional configuration parameters
 * @returns A filtered NearbyDrivers object with filtered buckets
 */
export function filterNearbyDrivers(
    nearbyDrivers: nearbyDriverRes | undefined,
    config: NearbyDriversConfig,
): nearbyDriverRes | undefined {
    // Set default config values if not provided
    const autoCategorySplitPercent = config.autoCategorySplitPercent ?? 50;
    const closeRangeDriversPercent = config.closeRangeDriversPercent ?? 60;
    const vehicleLimit = config.vehicleLimit;

    if (vehicleLimit === undefined) {
        return nearbyDrivers;
    }

    if (nearbyDrivers === undefined || !nearbyDrivers?.buckets?.length || !nearbyDrivers.vehicleDataBuckets.length) {
        return {
            serviceTierTypeToVehicleVariant: nearbyDrivers?.serviceTierTypeToVehicleVariant ?? {},
            variantLevelDriverCount: nearbyDrivers?.variantLevelDriverCount ?? {},
            buckets: nearbyDrivers?.buckets ?? [],
            vehicleDataBuckets: nearbyDrivers?.vehicleDataBuckets ?? [],
        };
    }

    // Define the two categories
    const AUTO_SET = new Set<VehicleVariant_vehicleVariant>(['AUTO_RICKSHAW', 'E_RICKSHAW']);
    const CAB_SET = new Set<VehicleVariant_vehicleVariant>([
        'SEDAN',
        'SUV',
        'HATCHBACK',
        'TAXI',
        'TAXI_PLUS',
        'PREMIUM_SEDAN',
        'BLACK',
        'BLACK_XL',
        'BIKE',
        'SUV_PLUS',
        'BIKE_PLUS',
        'AC_PRIORITY',
    ]);

    // Get all valid variants (those in either AUTO or CAB category) and Filter buckets to only include valid variants
    const validBuckets = nearbyDrivers.buckets.filter(
        bucket => AUTO_SET.has(bucket.variant) || CAB_SET.has(bucket.variant),
    );

    if (validBuckets.length === 0) {
        return {
            serviceTierTypeToVehicleVariant: nearbyDrivers.serviceTierTypeToVehicleVariant || '',
            variantLevelDriverCount: nearbyDrivers.variantLevelDriverCount || '',
            buckets: [],
            vehicleDataBuckets: [],
        };
    }

    // Prepare data structures for category-based processing
    const autoBuckets: nearByDriversBucket[] = validBuckets.filter(b => AUTO_SET.has(b.variant));
    const cabBuckets: nearByDriversBucket[] = validBuckets.filter(b => CAB_SET.has(b.variant));

    // Calculate category limits based on config
    const autoLimit = Math.ceil(vehicleLimit * (autoCategorySplitPercent / 100));
    const cabLimit = vehicleLimit - autoLimit;

    // Use the smallest radius from all valid buckets as the TARGET_RADIUS
    const TARGET_RADIUS = Math.min(...validBuckets.map(b => b.radius));

    // Split each category into close and far buckets
    const closeAutoBuckets = autoBuckets.filter(b => b.radius <= TARGET_RADIUS);
    const farAutoBuckets = autoBuckets.filter(b => b.radius > TARGET_RADIUS);

    const closeCabBuckets = cabBuckets.filter(b => b.radius <= TARGET_RADIUS);
    const farCabBuckets = cabBuckets.filter(b => b.radius > TARGET_RADIUS);

    // If no close buckets, use the smallest radius buckets
    const smallestRadiusForAuto = closeAutoBuckets.length === 0 && autoBuckets.length > 0;
    const smallestRadiusForCab = closeCabBuckets.length === 0 && cabBuckets.length > 0;

    if (smallestRadiusForAuto) {
        const smallestRadius = Math.min(...autoBuckets.map(b => b.radius));
        closeAutoBuckets.push(...autoBuckets.filter(b => b.radius === smallestRadius));
        // Remove these from far buckets
        const smallestRadiusBucketIds = new Set(closeAutoBuckets.map(b => `${b.radius}-${b.variant}`));
        farAutoBuckets.length = 0;
        farAutoBuckets.push(...autoBuckets.filter(b => !smallestRadiusBucketIds.has(`${b.radius}-${b.variant}`)));
    }

    if (smallestRadiusForCab) {
        const smallestRadius = Math.min(...cabBuckets.map(b => b.radius));
        closeCabBuckets.push(...cabBuckets.filter(b => b.radius === smallestRadius));
        // Remove these from far buckets
        const smallestRadiusBucketIds = new Set(closeCabBuckets.map(b => `${b.radius}-${b.variant}`));
        farCabBuckets.length = 0;
        farCabBuckets.push(...cabBuckets.filter(b => !smallestRadiusBucketIds.has(`${b.radius}-${b.variant}`)));
    }

    // Calculate close and far limits for each category based on config
    const closeAutoLimit = Math.ceil(autoLimit * (closeRangeDriversPercent / 100));
    const farAutoLimit = autoLimit - closeAutoLimit;

    const closeCabLimit = Math.ceil(cabLimit * (closeRangeDriversPercent / 100));
    const farCabLimit = cabLimit - closeCabLimit;

    // Track selected driver IDs to avoid duplicates
    const selectedDriverIds = new Set<string>();

    // Create a new NearbyDrivers object with filtered buckets
    const filteredNearbyDrivers: nearbyDriverRes = {
        serviceTierTypeToVehicleVariant: nearbyDrivers.serviceTierTypeToVehicleVariant,
        variantLevelDriverCount: nearbyDrivers.variantLevelDriverCount,
        buckets: [],
        vehicleDataBuckets: [],
    };

    // Helper function to select drivers from buckets

    const selectDriversFromBuckets = (buckets: nearByDriversBucket[], limit: number): driverInfo[] => {
        if (buckets.length === 0 || limit <= 0) return [];

        // Sort buckets by radius (ascending)
        const sortedBuckets = [...buckets].sort((a, b) => a.radius - b.radius);

        // Calculate how many drivers to allocate per bucket
        const driversPerBucket = Math.floor(limit / sortedBuckets.length);
        let mutableRemainingDrivers = limit - driversPerBucket * sortedBuckets.length;

        // Prepare result array
        const selectedDrivers: driverInfo[] = [];

        // Select drivers from each bucket
        for (const bucket of sortedBuckets) {
            // Determine how many drivers to take from this bucket
            let mutableToTake = driversPerBucket;
            if (mutableRemainingDrivers > 0) {
                mutableToTake++;
                mutableRemainingDrivers--;
            }

            // Get available drivers (not already selected)
            const availableDrivers = bucket.driverInfo.filter((d: driverInfo) => !selectedDriverIds.has(d.driverId));

            // Sort by distance
            const sortedDrivers = [...availableDrivers].sort(
                (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
            );

            // Take up to the allocation limit
            const driversToAdd = sortedDrivers.slice(0, mutableToTake);

            // Add selected drivers to results
            selectedDrivers.push(...driversToAdd);

            // Update selected driver IDs
            driversToAdd.forEach(driver => {
                selectedDriverIds.add(driver.driverId);
            });
        }

        return selectedDrivers;
    };

    // Select drivers from close buckets for both categories
    const closeAutoDrivers = selectDriversFromBuckets(closeAutoBuckets, closeAutoLimit);
    const closeCabDrivers = selectDriversFromBuckets(closeCabBuckets, closeCabLimit);

    // Select drivers from far buckets for both categories
    const farAutoDrivers = selectDriversFromBuckets(farAutoBuckets, farAutoLimit);
    const farCabDrivers = selectDriversFromBuckets(farCabBuckets, farCabLimit);

    // Group selected drivers by their original buckets
    // Build driverId → bucketKey map ONCE:
    const driverToBucketKey: Record<string, string> = {};
    for (const bucket of validBuckets) {
        const key = `${bucket.radius}-${bucket.variant}`;
        for (const d of bucket.driverInfo) {
            driverToBucketKey[d.driverId] = key;
        }
    }

    // Then, instead of groupDriversByBucket:
    const driversByBucket: Record<string, driverInfo[]> = {};
    function addDriversToBuckets(drivers: driverInfo[]) {
        for (const driver of drivers) {
            const key = driverToBucketKey[driver.driverId];
            if (key) {
                if (!driversByBucket[key]) driversByBucket[key] = [];
                driversByBucket[key].push(driver);
            }
        }
    }

    // Usage:
    addDriversToBuckets(closeAutoDrivers);
    addDriversToBuckets(closeCabDrivers);
    addDriversToBuckets(farAutoDrivers);
    addDriversToBuckets(farCabDrivers);
    // Create final buckets from grouped drivers

    for (const [key, drivers] of Object.entries(driversByBucket)) {
        const [radiusStr, variantStr] = key.split('-');
        const radius = parseInt(radiusStr ?? '0');
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const variant = variantStr as VehicleVariant_vehicleVariant;

        if (drivers.length > 0) {
            filteredNearbyDrivers.buckets.push({
                radius,
                variant,
                driverInfo: drivers,
            });
        }
    }

    // If we still haven't reached the limit, try to add more drivers
    const selectedCount = [...selectedDriverIds].length;
    if (selectedCount < vehicleLimit) {
        const remainingLimit = vehicleLimit - selectedCount;

        // Get all remaining drivers that weren't selected
        const remainingDrivers: driverInfo[] = [];
        for (const bucket of validBuckets) {
            const unselectedDrivers = bucket.driverInfo.filter(d => !selectedDriverIds.has(d.driverId));
            remainingDrivers.push(...unselectedDrivers);
        }

        // Sort by distance
        const sortedRemainingDrivers = [...remainingDrivers].sort(
            (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
        );

        // Take up to the remaining limit
        const additionalDrivers = sortedRemainingDrivers.slice(0, remainingLimit);

        // Group by original bucket
        const additionalByBucket: Record<string, driverInfo[]> = {};

        for (const driver of additionalDrivers) {
            for (const bucket of validBuckets) {
                const foundInBucket = bucket.driverInfo.some(d => d.driverId === driver.driverId);
                if (foundInBucket) {
                    const key = `${bucket.radius}-${bucket.variant}`;
                    if (!additionalByBucket[key]) {
                        additionalByBucket[key] = [];
                    }
                    additionalByBucket[key].push(driver);
                    selectedDriverIds.add(driver.driverId);
                    break;
                }
            }
        }

        // Add additional buckets
        for (const [key, drivers] of Object.entries(additionalByBucket)) {
            const [radiusStr, variantStr] = key.split('-');
            const radius = parseInt(radiusStr ?? '0');
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            const variant = variantStr as VehicleVariant_vehicleVariant;

            // Find if we already have a bucket for this radius and variant
            const existingBucketIndex = filteredNearbyDrivers.buckets.findIndex(
                b => b.radius === radius && b.variant === variant,
            );

            if (existingBucketIndex >= 0) {
                // Add to existing bucket
                const existingBucket = filteredNearbyDrivers.buckets[existingBucketIndex];
                if (existingBucket && existingBucket.driverInfo) {
                    existingBucket.driverInfo.push(...drivers);
                }
            } else if (drivers.length > 0) {
                // Create new bucket
                filteredNearbyDrivers.buckets.push({
                    radius,
                    variant,
                    driverInfo: drivers,
                });
            }
        }
    }

    return filteredNearbyDrivers;
}

export function filterNearbyPublicTransport(
    nearbyDrivers: nearbyDriverRes | undefined,
    maxVehicles: number,
): nearbyDriverRes | undefined {
    if (!nearbyDrivers) return undefined;

    // 1. Flatten all vehicles from all PublicTransport buckets
    const allVehicles: { vehicle: publicTransportInfo; bucketIndex: number }[] = [];

    nearbyDrivers.vehicleDataBuckets?.forEach((bucket, index) => {
        if (bucket.vehicleInfo.tag === 'PublicTransport') {
            bucket.vehicleInfo.contents.vehicles.forEach(vehicle => {
                allVehicles.push({ vehicle, bucketIndex: index });
            });
        }
    });

    // 2. Sort all vehicles by distance
    allVehicles.sort((a, b) => (a.vehicle.distance ?? Infinity) - (b.vehicle.distance ?? Infinity));

    // 3. Take top maxVehicles
    const topVehicles = allVehicles.slice(0, maxVehicles);

    // 4. Group back by bucket index
    const vehiclesByBucketIndex = new Map<number, publicTransportInfo[]>();
    topVehicles.forEach(({ vehicle, bucketIndex }) => {
        if (!vehiclesByBucketIndex.has(bucketIndex)) {
            vehiclesByBucketIndex.set(bucketIndex, []);
        }
        vehiclesByBucketIndex.get(bucketIndex)?.push(vehicle);
    });

    // 5. Reconstruct buckets
    const filteredVehicleDataBuckets = nearbyDrivers.vehicleDataBuckets
        ?.map((bucket, index) => {
            if (bucket.vehicleInfo.tag === 'PublicTransport') {
                const allowedVehicles = vehiclesByBucketIndex.get(index) || [];
                return {
                    ...bucket,
                    vehicleInfo: {
                        ...bucket.vehicleInfo,
                        contents: {
                            ...bucket.vehicleInfo.contents,
                            vehicles: allowedVehicles,
                        },
                    },
                };
            }
            return bucket;
        })
        .filter(bucket => {
            if (bucket.vehicleInfo.tag === 'PublicTransport') {
                return bucket.vehicleInfo.contents.vehicles.length > 0;
            }
            return true;
        });

    return {
        ...nearbyDrivers,
        vehicleDataBuckets: filteredVehicleDataBuckets || [],
    };
}
export const createBucketSignature = (buckets: nearByDriversBucket[] | undefined) => {
    if (!buckets || buckets.length === 0) return '';
    return buckets.map(bucket => `${bucket.radius}-${bucket.variant}-${bucket.driverInfo.length}`).join('|');
};
