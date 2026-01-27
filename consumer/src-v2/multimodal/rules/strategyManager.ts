import { IJourneyStrategy } from './strategies/types';
import { DefaultStrategy } from './strategies/defaultStrategy';
import { WalkStrategy } from './strategies/walkStrategy';
import { TaxiStrategy } from './strategies/taxiStrategy';
import { BusWaitingStrategy } from './strategies/waiting/busWaitingStrategy';
import { MetroWaitingStrategy } from './strategies/waiting/metroWaitingStrategy';
import { BusInVehicleStrategy } from './strategies/invehicle/busInVehicleStrategy';
import { MetroInVehicleStrategy } from './strategies/invehicle/metroInVehicleStrategy';
import { ExitStationStrategy } from './strategies/exitStationStrategy';
import { TransitMode } from '../types/journeyTracking';
import { ProcessedLegInfo } from '../types/journeyTracking';
import { TrainInVehicleStrategy } from './strategies/invehicle/trainInVehicleStrategy';
import { checkTaxiLeg } from '@/typescript/utils/common';

export class StrategyManager {
    private waitingStrategies: Map<TransitMode, IJourneyStrategy>;
    private inVehicleStrategies: Map<TransitMode, IJourneyStrategy>;
    private walkStrategy: IJourneyStrategy;
    private taxiStrategy: IJourneyStrategy;
    private defaultStrategy: IJourneyStrategy;
    private exitStationStrategy: IJourneyStrategy;

    constructor() {
        this.waitingStrategies = new Map();
        this.inVehicleStrategies = new Map();

        this.walkStrategy = new WalkStrategy();
        this.taxiStrategy = new TaxiStrategy();
        this.defaultStrategy = new DefaultStrategy();
        this.exitStationStrategy = new ExitStationStrategy();

        this.waitingStrategies.set('BUS', new BusWaitingStrategy());
        this.waitingStrategies.set('METRO', new MetroWaitingStrategy());
        this.waitingStrategies.set('SUBWAY', new MetroWaitingStrategy());

        this.inVehicleStrategies.set('BUS', new BusInVehicleStrategy());
        this.inVehicleStrategies.set('METRO', new MetroInVehicleStrategy());
        this.inVehicleStrategies.set('SUBWAY', new TrainInVehicleStrategy());
    }

    getStrategiesForLeg(leg: ProcessedLegInfo, nextLeg: ProcessedLegInfo | undefined): IJourneyStrategy[] {
        const isMetroToMetro = leg.transitMode === 'METRO' && nextLeg?.transitMode === 'METRO';
        const isTrainToTrain = leg.transitMode === 'SUBWAY' && nextLeg?.transitMode === 'SUBWAY';
        if (leg.transitMode === 'WALK') {
            return [this.walkStrategy];
        }
        if (checkTaxiLeg(leg.transitMode)) {
            return [this.taxiStrategy];
        }
        if (leg.userState === 'EXITSTATION') {
            return isMetroToMetro || isTrainToTrain ? [] : [this.exitStationStrategy];
        }
        if (leg.userState === 'INVEHICLE') {
            return isMetroToMetro || isTrainToTrain
                ? [this.inVehicleStrategies.get(leg.transitMode) || this.defaultStrategy]
                : [this.inVehicleStrategies.get(leg.transitMode) || this.defaultStrategy, this.exitStationStrategy];
        }
        const waitingStrategy = this.waitingStrategies.get(leg.transitMode);
        const inVehicleStrategy = this.inVehicleStrategies.get(leg.transitMode);
        const baseStrategies = [waitingStrategy, inVehicleStrategy];
        const allStrategies =
            isMetroToMetro || isTrainToTrain ? baseStrategies : [...baseStrategies, this.exitStationStrategy];
        return allStrategies.filter((s): s is IJourneyStrategy => s !== undefined);
    }

    getWaitingStrategy(transitMode: TransitMode): IJourneyStrategy {
        return this.waitingStrategies.get(transitMode) || this.defaultStrategy;
    }

    getDefaultStrategy(): IJourneyStrategy {
        return this.defaultStrategy;
    }
}
