const BASE32: string = '0123456789bcdefghjkmnpqrstuvwxyz';

const NEIGHBOUR_MAP: Record<'n' | 's' | 'e' | 'w', readonly [string, string]> = {
    n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
    s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
    e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
    w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb'],
};

const BORDER_MAP: Record<'n' | 's' | 'e' | 'w', readonly [string, string]> = {
    n: ['prxz', 'bcfguvyz'],
    s: ['028b', '0145hjnp'],
    e: ['bcfguvyz', 'prxz'],
    w: ['0145hjnp', '028b'],
};

export const encodeGeoHash = (latitude: number, longitude: number, precision: number): string => {
    // Recursive function to build the geohash
    const buildGeohash = (
        latMin: number,
        latMax: number,
        lonMin: number,
        lonMax: number,
        geohash: string,
        isEven: boolean,
        bit: number,
        ch: number,
    ): string => {
        if (geohash.length >= precision) {
            return geohash;
        }

        // Calculate midpoint of current dimension
        const mid = isEven ? (lonMin + lonMax) / 2 : (latMin + latMax) / 2;

        // Determine if the coordinate is in the upper half
        const inUpperHalf = isEven ? longitude >= mid : latitude >= mid;

        // Set the bit if coordinate is in upper half
        const newCh = inUpperHalf ? ch | (1 << (4 - bit)) : ch;

        // Adjust the min/max bounds
        const newLatMin = inUpperHalf && !isEven ? mid : latMin;
        const newLatMax = !inUpperHalf && !isEven ? mid : latMax;
        const newLonMin = inUpperHalf && isEven ? mid : lonMin;
        const newLonMax = !inUpperHalf && isEven ? mid : lonMax;

        // Toggle between longitude and latitude
        const newIsEven = !isEven;

        // Check if we've built a complete 5-bit character
        if (bit < 4) {
            return buildGeohash(newLatMin, newLatMax, newLonMin, newLonMax, geohash, newIsEven, bit + 1, newCh);
        } else {
            // Add the base32 character and reset for the next character
            const newGeohash = geohash + BASE32[newCh];
            return buildGeohash(newLatMin, newLatMax, newLonMin, newLonMax, newGeohash, newIsEven, 0, 0);
        }
    };

    // Initialize bounds and start the recursion
    return buildGeohash(-90.0, 90.0, -180.0, 180.0, '', true, 0, 0);
};

export const decodeGeoHash = (geohash: string): { latitude: number; longitude: number } => {
    const bits = geohash
        .toLowerCase()
        .split('')
        .map(char => BASE32.indexOf(char).toString(2).padStart(5, '0'))
        .join('');

    const initialBounds = {
        latMin: -90.0,
        latMax: 90.0,
        lonMin: -180.0,
        lonMax: 180.0,
        evenBit: true,
    };

    const final = Array.from(bits).reduce((acc, bit) => {
        const mid = acc.evenBit ? (acc.lonMin + acc.lonMax) / 2 : (acc.latMin + acc.latMax) / 2;

        return acc.evenBit
            ? {
                  ...acc,
                  lonMin: bit === '1' ? mid : acc.lonMin,
                  lonMax: bit === '1' ? acc.lonMax : mid,
                  evenBit: false,
              }
            : {
                  ...acc,
                  latMin: bit === '1' ? mid : acc.latMin,
                  latMax: bit === '1' ? acc.latMax : mid,
                  evenBit: true,
              };
    }, initialBounds);

    return {
        latitude: (final.latMin + final.latMax) / 2,
        longitude: (final.lonMin + final.lonMax) / 2,
    };
};

export const adjacentGeohash = (geohash: string, direction: 'n' | 's' | 'e' | 'w'): string => {
    if (!geohash || !['n', 's', 'e', 'w'].includes(direction)) {
        throw new Error('Invalid geohash or direction');
    }

    const type = geohash.length % 2;
    const lastChar = geohash.slice(-1);
    const parent = geohash.slice(0, -1);

    const borderEntry = BORDER_MAP[direction]?.[type];
    const adjustedParent =
        borderEntry?.includes(lastChar) && parent.length > 0 ? adjacentGeohash(parent, direction) : parent;

    const neighborEntry = NEIGHBOUR_MAP[direction]?.[type];
    const charIndex = neighborEntry?.indexOf(lastChar) ?? -1;

    return charIndex >= 0 && neighborEntry ? adjustedParent + BASE32[charIndex] : adjustedParent;
};

export const geohashNeighbours = (geohash: string): string[] => {
    const nDirection = adjacentGeohash(geohash, 'n');
    const sDirection = adjacentGeohash(geohash, 's');
    const eDirection = adjacentGeohash(geohash, 'e');
    const wDirection = adjacentGeohash(geohash, 'w');

    const neighbours = [
        nDirection,
        sDirection,
        eDirection,
        wDirection,
        adjacentGeohash(nDirection, 'e'),
        adjacentGeohash(sDirection, 'e'),
        adjacentGeohash(sDirection, 'w'),
        adjacentGeohash(nDirection, 'w'),
    ];

    return neighbours;
};
