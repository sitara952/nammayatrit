import LottieView, { AnimationObject, LottieViewProps } from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { ViewProps, Image } from 'react-native';
import RNFS from 'react-native-fs';

const getSourcePath = (
    source:
        | string
        | AnimationObject
        | {
              uri: string;
          }
        | undefined,
) => {
    try {
        const uri =
            //eslint-disable-next-line myCustomPlugin/no-as-in-modified-files, myCustomPlugin/no-any-in-modified-files
            (source as any).uri;
        if (typeof source === 'object' && uri) {
            if (uri.includes('.lottie')) {
                return { sourceDotLottieURI: uri };
            }
        }

        if (typeof source === 'number') {
            const resolved = Image.resolveAssetSource(source);
            if (resolved.uri && resolved.uri.includes('file:///') && resolved.uri.includes('lottie'))
                return { sourceDotLottieURI: resolved.uri };
        }
        return undefined;
    } catch {
        return undefined;
    }
};

type LottieWithFallbackProps = LottieViewProps & {
    // eslint-disable-next-line myCustomPlugin/enforce-optional-params
    containerProps?: ViewProps;
    // eslint-disable-next-line myCustomPlugin/enforce-optional-params
    lottieRef?: React.Ref<LottieView>;
    fallback: React.ReactNode | undefined;
};

export const LottieWithFallback: React.FC<LottieWithFallbackProps> = ({
    fallback = <></>,
    ...props
}: LottieWithFallbackProps) => {
    const [pathExist, setPathExist] = useState<boolean>(false);
    const getPath = getSourcePath(props.source);
    const sourceUri = getPath?.sourceDotLottieURI;
    const isRemoteLottie = sourceUri ? sourceUri.startsWith('http') : false;

    useEffect(() => {
        if (!sourceUri) {
            setPathExist(false);
            return;
        }

        if (isRemoteLottie) {
            setPathExist(true);
            return;
        }

        RNFS.exists(sourceUri).then(exists => {
            setPathExist(exists);
        });
    }, [sourceUri, isRemoteLottie]);

    return !getPath || pathExist ? <LottieView ref={props.lottieRef} {...props} /> : fallback;
};
