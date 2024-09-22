'use client';

import { usePathname } from 'next/navigation';
import FormContainer from '../form/FormContainer';
import { toggleFavouriteAction } from '@/utils/actions';
import { CardSubmitButton } from '../form/Buttons';

type FavouriteToggleFormProps = {
	productId: string;
	favouriteId: string | null;
};

const FavouriteToggleForm = ({
	productId,
	favouriteId,
}: FavouriteToggleFormProps) => {
	const pathname = usePathname();
	const toggleAction = toggleFavouriteAction.bind(null, {
		productId,
		favouriteId,
		pathname,
	});

	return (
		<FormContainer action={toggleAction}>
			<CardSubmitButton isFavourite={favouriteId ? true : false} />
		</FormContainer>
	);
};

export default FavouriteToggleForm;
