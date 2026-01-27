import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View } from 'react-native';
import { Icon } from '@/typescript/components/Icon';
import { StarEmpty, StarFilled } from '@/typescript/components/svg/Star';

export type StarRatingProps = {
    rating: number | undefined;
    total: number;
};

export const StarRating: React.FC<StarRatingProps> = ({ rating, total }) => {
    // TODO: handle skipped feedback
    const nonUndefinedRating = rating || 0;
    const emptyStars = total - nonUndefinedRating || 0;
    const fullStarsArray = new Array(rating).fill(0);
    const emptyStarsArray = new Array(emptyStars).fill(0);
    return (
        <View style={tailwind.style('flex-row gap-1')}>
            {fullStarsArray.map((_, index) => (
                <Icon icon={<StarFilled fill={'#FBC504'} />} size={21} key={index} />
            ))}
            {emptyStarsArray.map((_, index) => (
                <Icon icon={<StarEmpty fill={'#D2D2D2'} />} size={21} key={index} />
            ))}
        </View>
    );
};
