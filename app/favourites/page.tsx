import SectionTitle from '@/components/global/SectionTitle';
import ProductsGrid from '@/components/products/ProductsGrid';
import { fetchUserFavourites } from '@/utils/actions';

const FavouritesPage = async () => {
	const favourites = await fetchUserFavourites();

	if (favourites.length === 0) {
		return <SectionTitle text="You have no favourites yet." />;
	}

	return (
		<div>
			<SectionTitle text="Favourites" />
			<ProductsGrid
				products={favourites.map((favourite) => favourite.product)}
			/>
		</div>
	);
};

export default FavouritesPage;
