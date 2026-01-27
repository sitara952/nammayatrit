export type PickupInstructionsConfig = {
    locations: {
        name: string;
        gates: {
            gateName: string;
            images: PickupInstructionsType[];
        }[];
    }[];
};

export type PickupInstructionsType = {
    title: string;
    image: string;
};

export type PickupInstructionsProps = {
    instructions: PickupInstructionsType[];
    openMapsUri: string;
};
