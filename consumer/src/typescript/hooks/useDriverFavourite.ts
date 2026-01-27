import { useDriverFavoritesGetQuery } from '@/api/integrations/rtk/DriverFavoritesGet';
import { useFavoritesDriverIdRemovePostMutation } from '@/api/integrations/rtk/FavoritesDriverIdRemovePost';
import { useCallback } from 'react';

export const useDriverFavourite = () => {
    const { data: favoriteDrivers, error, isLoading, isFetching, refetch } = useDriverFavoritesGetQuery({});
    const [deleteFavoriteDriver, { isLoading: isDeleting }] = useFavoritesDriverIdRemovePostMutation();

    const deleteDriver = useCallback(
        async (driverId: string) => {
            try {
                await deleteFavoriteDriver({ driverId }).unwrap();
                refetch();
            } catch (err) {
                console.error('Failed to delete the driver:', err);
                throw err;
            }
        },
        [deleteFavoriteDriver, refetch],
    );

    return {
        favoriteDrivers,
        error,
        isLoading,
        isFetching,
        isDeleting,
        deleteDriver,
    };
};
