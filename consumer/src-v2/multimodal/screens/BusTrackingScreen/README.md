# Bus Tracking Screen - Dummy Data Implementation

This directory contains a complete dummy data system for simulating bus tracking functionality when backend data is not available.

## Files

- **`busDummy.ts`** - Contains all dummy data including waypoints, simulation points, bus stops, and vehicle data
- **`useDummyData.ts`** - React hook that manages dummy data with timer-based animation
- **`Flow.tsx`** - Main component with wrapper logic that switches between real and dummy data
- **`UI.tsx`** - UI component (existing)

## How It Works

### 1. Path and Simulation Points

- **`pathDummy`**: Main route waypoints (2,191 points from Marina Beach to Poonamallee)
- **`vehicleSimulationPoints`**: Intermediate points spaced 70-150m apart for realistic vehicle movement (~590 points)
- **`dummyBusStops`**: 13 major bus stops along the route

### 2. Vehicle Animation

The `useDummyData` hook creates 1 bus for detailed tracking and debugging:
- **Bus 1**: Moves sequentially through all simulation points along the route

The bus updates its position every 2 seconds (configurable via `DUMMY_CONFIG.ANIMATION_INTERVAL`).

### 3. Configuration

Edit `DUMMY_CONFIG` in `busDummy.ts`:

```typescript
export const DUMMY_CONFIG = {
    ENABLED: true, // Set to false to use real data
    ANIMATION_INTERVAL: 2000, // 2 seconds between updates
    ROUTE_CODE: 'DUMMY_ROUTE_001',
    VEHICLE_TYPE: 'BUS',
    SOURCE_CODE: 'STOP_001',
};
```

### 4. Switching Between Real and Dummy Data

The system automatically switches based on `DUMMY_CONFIG.ENABLED`:

- **Dummy Mode**: Uses `useDummyData` hook, skips real API calls
- **Real Mode**: Uses actual backend data, ignores dummy data

### 5. Visual Indicators

When in dummy mode:
- Route name shows `[DEMO]` suffix
- Console logs show dummy data statistics
- All vehicles animate smoothly along the predefined path

## Usage

1. **Enable Dummy Mode**: Set `DUMMY_CONFIG.ENABLED = true` in `busDummy.ts`
2. **Navigate to Bus Tracking**: The screen will automatically use dummy data
3. **Watch Animation**: Buses will move along the route every 2 seconds
4. **Disable Dummy Mode**: Set `DUMMY_CONFIG.ENABLED = false` to use real data

## Customization

### Adding More Vehicles
Edit the `createDummyVehicleData` function in `busDummy.ts` to add more buses.

### Changing Animation Speed
Modify `DUMMY_CONFIG.ANIMATION_INTERVAL` (in milliseconds).

### Adding Bus Stops
Add more stops to the `dummyBusStops` array with proper coordinates and sequence numbers.

### Modifying Route
Update `pathDummy` with new waypoints, and regenerate `vehicleSimulationPoints` accordingly.

## Logging

When in dummy mode, you'll see clean, simple logs with filterable tags:

- **`[BUS_DUMMY]`**: Vehicle movement with timing, progress, coordinates, distance, and rotation
- **`[BUS_SNAP]`**: Path snapping with index, distance, and snap status
- **`[BUS_INIT]`**: Initial setup information

Example log output:
```
[BUS_INIT] DUMMY MODE: Route 29C [DEMO] | 590 waypoints | 13 stops
[BUS_DUMMY] JOURNEY STARTED at 2:30:45 PM
[BUS_DUMMY] Move [1/590] 0.2% | 0:02 | 12.92761,80.11867 → 12.92752,80.11857 | 11.2m | 225°
[BUS_SNAP] Index: 1, Distance: 5.3m, Snapped: true
[BUS_DUMMY] Move [2/590] 0.3% | 0:04 | 12.92752,80.11857 → 12.92743,80.11847 | 11.1m | 225°
[BUS_SNAP] Index: 2, Distance: 4.1m, Snapped: true
...
[BUS_DUMMY] JOURNEY COMPLETED! Total time: 19:40 | Distance covered: 590 points
```

## Technical Details

- Uses proper TypeScript interfaces matching the real API
- Handles both dummy and real data types seamlessly  
- Includes proper error handling and loading states
- Maintains compatibility with existing `useLiveTracking` hook
- Provides realistic vehicle movement with proper timing
- Supports all existing bus tracking features (stops, ETAs, etc.)
- Comprehensive logging system for debugging vehicle movement and snapping
