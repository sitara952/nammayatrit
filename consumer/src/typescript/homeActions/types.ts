import type { DestinationPayload } from '@/src-v2/systems/configs/types';
import type {
    MainTabParamList,
    ServicesTabParamList,
    HomeTabParamList,
    ProfileTabParamList,
    LiveTabParamList,
    TicketsTabParamList,
    PassesTabParamList,
    MainNavigationParamList,
} from '@/typescript/navigation/globalParamList';

export type NavigationConfig =
    | {
          navigator: 'mainTab';
          screen: keyof MainTabParamList;
          pop: boolean | undefined;
      }
    | {
          [K in keyof ServicesTabParamList]: {
              navigator: 'servicesTab';
              screen: K;
              params: ServicesTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof ServicesTabParamList]
    | {
          [K in keyof HomeTabParamList]: {
              navigator: 'homeTab';
              screen: K;
              params: HomeTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof HomeTabParamList]
    | {
          [K in keyof ProfileTabParamList]: {
              navigator: 'profileTab';
              screen: K;
              params: ProfileTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof ProfileTabParamList]
    | {
          [K in keyof LiveTabParamList]: {
              navigator: 'liveTab';
              screen: K;
              params: LiveTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof LiveTabParamList]
    | {
          [K in keyof TicketsTabParamList]: {
              navigator: 'ticketsTab';
              screen: K;
              params: TicketsTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof TicketsTabParamList]
    | {
          [K in keyof PassesTabParamList]: {
              navigator: 'passesTab';
              screen: K;
              params: PassesTabParamList[K];
              pop: boolean | undefined;
          };
      }[keyof PassesTabParamList]
    | {
          [K in keyof MainNavigationParamList]: {
              navigator: 'root';
              screen: K;
              params: MainNavigationParamList[K];
          };
      }[keyof MainNavigationParamList];

export interface ActionPayloadMap {
    navigateToScreen: {
        source: string | undefined;
        actionData: NavigationConfig;
    };

    navigateToStage: {
        source: string | undefined;
        actionData:
            | 'Home'
            | 'Search'
            | 'IntercitySearchDetails'
            | 'ConfirmPickup'
            | 'SearchErrorStates'
            | 'LookingForRides'
            | 'ChooseRide'
            | 'RetryBoostedSearch';
    };

    redbus: {
        source: string | undefined;
        actionData: string | undefined;
    };

    openBoating: {
        source: string | undefined;
    };

    showNammaTransitPopup: {
        source: string | undefined;
    };

    destination: {
        source: string | undefined;
        actionData: DestinationPayload;
    };

    shareApp: {
        source: string | undefined;
    };

    openLink: {
        source: string | undefined;
        actionData: string;
    };

    navigateTo: {
        source: string | undefined;
        actionData: string;
    };

    navigateToHybridFlow: {
        source: string | undefined;
        actionData: {
            viewParam: string;
        };
    };
}

export type ActionIdentifier = keyof ActionPayloadMap;
export type PayloadForAction<T extends ActionIdentifier> = ActionPayloadMap[T];
