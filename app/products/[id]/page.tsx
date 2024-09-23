import BreadCrumbs from '@/components/single-product/BreadCrumbs';
import { fetchSingleProduct, findExistingReview } from '@/utils/actions';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';
import FavouriteToggleButton from '@/components/products/FavouriteToggleButton';
import AddToCart from '@/components/single-product/AddToCart';
import ProductRating from '@/components/single-product/ProductRating';
import ShareButton from '@/components/single-product/ShareButton';
import SubmitReview from '@/components/reviews/SubmitReview';
import ProductReviews from '@/components/reviews/ProductReviews';
import { auth } from '@clerk/nextjs/server';

const SingleProductPage = async ({ params }: { params: { id: string } }) => {
	const product = await fetchSingleProduct(params.id);
	const { name, image, company, description, price } = product;
	const poundAmount = formatCurrency(price);
	const { userId } = auth();
	const reviewDoesNotExist =
		userId && !(await findExistingReview(userId, product.id));

	return (
		<section>
			<BreadCrumbs name={product.name} />
			<div className="mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16">
				{/* Image first col 1 */}
				<div className="relative h-full">
					<Image
						src={image}
						alt={name}
						fill
						sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
						priority
						className="w-full rounded object-cover"
					/>
				</div>
				{/* Product info col 2 */}
				<div>
					<div className="flex gap-x-8 items-center">
						<h1 className="capitalize text-3xl font-bold">{name}</h1>
						<div className="flex items-center gap-x-2">
							<FavouriteToggleButton productId={params.id} />
							<ShareButton name={product.name} productId={params.id} />
						</div>
					</div>
					<ProductRating productId={params.id} />
					<h4 className="text-xl mt-2">{company}</h4>
					<p className="mt-3 text-md bg-muted inline-block p-2 rounded">
						{poundAmount}
					</p>
					<p className="mt-6 leading-8 text-muted-foreground">{description}</p>
					<AddToCart productId={params.id} />
				</div>
			</div>
			<ProductReviews productId={params.id} />
			{reviewDoesNotExist && <SubmitReview productId={params.id} />}
		</section>
	);
};

export default SingleProductPage;
