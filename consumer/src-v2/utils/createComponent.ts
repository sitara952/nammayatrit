/* eslint-disable myCustomPlugin/no-as-in-modified-files */
/* eslint-disable myCustomPlugin/no-any-in-modified-files */
import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { createElement } from './createElement';

export function createComponent<Props extends object>(
    componentType: React.ComponentType<Props>,
    options: { shouldMemo: boolean | undefined } | undefined,
): React.ForwardRefExoticComponent<Props & React.RefAttributes<unknown>> | typeof componentType {
    const _component = (props: Props, ref: unknown) => {
        return createElement<Props>({
            componentType,
            props: { ...props, ref },
        });
    };
    // eslint-disable-next-line functional/no-let
    let ForwardedComponent = React.forwardRef<unknown, PropsWithChildren<Props>>(
        _component as any, // React.ForwardRefRenderFunction<unknown, PropsWithChildren<Props>>
    );
    if (options?.shouldMemo) {
        ForwardedComponent = React.memo(ForwardedComponent);
    }
    return ForwardedComponent as unknown as
        | React.ForwardRefExoticComponent<Props & React.RefAttributes<unknown>>
        | typeof componentType;
}
