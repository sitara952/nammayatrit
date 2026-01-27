export const enum APIStatus {
    SUCCESS,
    FAILED,
}

export type APIStatusComponentProps = {
    status: APIStatus;
    headerText: string;
    subHeaderText: string | undefined;
    buttonText: string | undefined;
    onPress: () => void;
};
