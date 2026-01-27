/********************************
 * @deprecated Note: This is deprecated, moved these function of higher compute order to individual native bridges
 ********************************/

import { mmEstimateRouteType } from '../MapType';

/********************************
 * 1. TYPE DEFINITIONS
 ********************************/
// export interface LatLng {
//   latitude: number;
//   longitude: number;
// }

/********************************
 * 2. CONSTANTS (for approximations)
 ********************************/
// Average radius of Earth in meters
const EARTH_RADIUS = 6371008.8;

/*
 * For small distances, we often approximate
 *  - 1 degree of latitude ≈ 111,320 meters
 *  - 1 degree of longitude ≈ 111,320 * cos(latitude) meters
 */

/********************************
 * 3. HELPER FUNCTIONS
 ********************************/

/**
 * Convert degrees to radians.
 */
function toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * Haversine distance between two LatLng points.
 * Returns distance in meters.
 */
function haversineDistance(a: NativeLatLng | undefined, b: NativeLatLng | undefined): number {
    if (a === undefined || b === undefined) return 0;

    const lat1 = toRadians(a.latitude);
    const lat2 = toRadians(b.latitude);
    const dLat = lat2 - lat1;
    const dLon = toRadians(b.longitude - a.longitude);

    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(h));

    return EARTH_RADIUS * c; // distance in meters
}

/**
 * Approximate projection of LatLng to a local XY coordinate system (in meters)
 * relative to a chosen "origin".
 *
 * This can be used for small distances.
 * For large distances or high accuracy, you should use a proper map projection.
 */
function latLngToLocalXY(point: NativeLatLng, origin: NativeLatLng): { x: number; y: number } {
    // 1 deg of lat ~ 111,320 m
    // 1 deg of lon ~ 111,320 * cos(lat) m
    const latScale = 111320;
    const originLatInRad = toRadians(origin.latitude);
    const lonScale = 111320 * Math.cos(originLatInRad);

    const x = (point.longitude - origin.longitude) * lonScale;
    const y = (point.latitude - origin.latitude) * latScale;

    return { x, y };
}

/**
 * Converts local XY (in meters) back to LatLng relative to the same origin.
 */
function localXYToLatLng(xy: { x: number; y: number }, origin: NativeLatLng): NativeLatLng {
    const latScale = 111320;
    const originLatInRad = toRadians(origin.latitude);
    const lonScale = 111320 * Math.cos(originLatInRad);

    const longitude = origin.longitude + xy.x / lonScale;
    const latitude = origin.latitude + xy.y / latScale;

    return { latitude, longitude };
}

/**
 * Given a point `p` and a segment `AB`, compute the point on the segment
 * that is closest to `p`, using a local XY coordinate approximation.
 *
 * @param p The point of interest (LatLng)
 * @param A Segment start (LatLng)
 * @param B Segment end (LatLng)
 * @returns The closest LatLng on segment AB to point p
 */
function closestPointOnSegment(
    p: NativeLatLng,
    A: NativeLatLng | undefined,
    B: NativeLatLng | undefined,
): NativeLatLng {
    // Choose an "origin" for local projection to minimize error.
    // Here we pick A as origin, but you could pick something else.
    if (A === undefined || B === undefined) return p;
    const origin = A;

    // Convert A, B, p into local XY coords
    const Axy = latLngToLocalXY(A, origin);
    const Bxy = latLngToLocalXY(B, origin);
    const Pxy = latLngToLocalXY(p, origin);

    // Define AB and AP in XY
    const AB = { x: Bxy.x - Axy.x, y: Bxy.y - Axy.y };
    const AP = { x: Pxy.x - Axy.x, y: Pxy.y - Axy.y };

    // Compute the dot products
    const ABdotAB = AB.x * AB.x + AB.y * AB.y; // |AB|^2
    const APdotAB = AP.x * AB.x + AP.y * AB.y;

    // Handle degenerate case first
    if (ABdotAB === 0) {
        return A; // A and B are the same point
    }

    // Compute t with clamping in one step
    const t = Math.max(0, Math.min(1, APdotAB / ABdotAB));

    // Now compute the projected XY
    const proj = {
        x: Axy.x + t * AB.x,
        y: Axy.y + t * AB.y,
    };

    // Convert back to LatLng
    return localXYToLatLng(proj, origin);
}

/**
 * Iterates over all segments in the path and finds the one that yields
 * the minimum distance to `currPoint`.
 *
 * @param currPoint The point of interest
 * @param path The path: an array of LatLng (e.g., your polyline route)
 * @returns An object with:
 *    - `segmentIndex`: the index of the starting point of the closest segment
 *    - `distance`: the minimum distance (in meters)
 *    - `location`: the LatLng of the closest point on the path
 */
type NativeLatLng = { latitude: number; longitude: number };

export function getClosestPointOnPath(
    currPoint: NativeLatLng,
    path: NativeLatLng[],
): {
    segmentIndex: number;
    distance: number;
    location: NativeLatLng | undefined;
} {
    if (path.length === 0) {
        return { segmentIndex: -1, distance: -1, location: undefined };
    }

    if (path.length === 1) {
        // Path has only one point, return that
        const dist = haversineDistance(currPoint, path[0]);
        return { segmentIndex: 0, distance: dist, location: path[0] };
    }

    // Use array reduction to find the closest segment
    const { minDist, bestIndex, bestPoint } = path.slice(0, -1).reduce(
        (acc, A, i) => {
            const B = path[i + 1];
            const candidate = closestPointOnSegment(currPoint, A, B);
            const dist = haversineDistance(currPoint, candidate);

            return dist < acc.minDist ? { minDist: dist, bestIndex: i, bestPoint: candidate } : acc;
        },
        { minDist: Infinity, bestIndex: -1, bestPoint: null as NativeLatLng | null },
    );

    // By the end, bestSegmentIndex and bestPointOnSegment should be the best match
    return {
        segmentIndex: bestIndex,
        distance: minDist,
        location: bestPoint || path[0],
    };
}

export const getDistanceBtwPoints = (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
) => {
    const R = 6371e3; // Earth's radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);
    const deltaLat = lat2 - lat1;
    const deltaLon = toRad(point2.longitude - point1.longitude);
    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

export type NearestPointResult = {
    point: { latitude: number; longitude: number } | null;
    distance: number;
    index: number;
};

export const findNearestPoint = (
    points: { latitude: number; longitude: number }[],
    target: { latitude: number; longitude: number },
): NearestPointResult => {
    return points.reduce<NearestPointResult>(
        (nearest, point, index) => {
            const distance = getDistanceBtwPoints(point, target);
            return distance < nearest.distance ? { point, distance, index } : nearest;
        },
        { point: null, distance: Number.MAX_VALUE, index: -1 },
    );
};

export const mergeCoordinates = (
    from: mmEstimateRouteType | undefined,
    to: mmEstimateRouteType | undefined,
    isTransit: boolean,
): mmEstimateRouteType | undefined => {
    if (!from || !to) return undefined;

    const lastCoord = from.coordinates[from.coordinates.length - 1];
    const firstCoord = to.coordinates[0];

    return {
        ...from,
        coordinates:
            isTransit && lastCoord
                ? [lastCoord, ...to.coordinates]
                : firstCoord
                  ? [...from.coordinates, firstCoord]
                  : [...from.coordinates],
    };
};
