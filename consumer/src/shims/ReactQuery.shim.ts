import { UseQueryResult } from '@tanstack/react-query';

//Define a generic queryResult type alias
export type queryResult<Error, Data> = UseQueryResult<Data, Error>;
