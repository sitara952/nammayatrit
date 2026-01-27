import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HomescreenModules } from '../../../../src-v2/systems/configs/types';

// Define the state structure
interface ScoreState {
    scores: Record<ScoringKeys, number>;
    lastUpdated: Record<ScoringKeys, number>;
}

export type ScoringKeys = HomescreenModules | 'LIVE_STATS';

// Initial state with default scores of 0 for all modules
const initialState: ScoreState = {
    scores: {
        NAMMA_SERVICES: 0,
        BANNERS: 0,
        HOURLY_RENTALS: 0,
        INTERCITY_RECOMMENDATIONS: 0,
        NEARBY_EVENTS: 0,
        EXPLORE: 0,
        LIVE_STATS: 0,
    },
    lastUpdated: {
        NAMMA_SERVICES: 0,
        BANNERS: 0,
        HOURLY_RENTALS: 0,
        INTERCITY_RECOMMENDATIONS: 0,
        NEARBY_EVENTS: 0,
        EXPLORE: 0,
        LIVE_STATS: 0,
    },
};

const scoreSlice = createSlice({
    name: 'scoring',
    initialState,
    reducers: {
        setComponentScore: (state, action: PayloadAction<{ component: ScoringKeys; score: number }>) => {
            const { component, score } = action.payload;
            state.scores[component] = score;
            state.lastUpdated[component] = Date.now();
        },
        increaseScoreBy: (state, action: PayloadAction<{ component: ScoringKeys; increment: number }>) => {
            const { component, increment } = action.payload;
            state.scores[component] += increment;
            state.lastUpdated[component] = Date.now();
        },
        resetComponentScores: state => {
            Object.keys(state.scores).forEach(key => {
                state.scores[key as ScoringKeys] = 0;
                state.lastUpdated[key as HomescreenModules] = 0;
            });
        },
    },
});

// Export actions
export const { setComponentScore, increaseScoreBy, resetComponentScores } = scoreSlice.actions;

// Selectors
export const selectComponentScore = (state: { scoring: ScoreState }, component: HomescreenModules) =>
    state.scoring.scores[component];

export const selectAllComponentScores = (state: { scoring: ScoreState }) => state.scoring.scores;

export default scoreSlice;
