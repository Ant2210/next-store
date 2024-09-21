import { Button } from '@/components/ui/button';

const AddToCart = ({ productId }: { productId: string }) => {
	console.log(productId);
	return (
		<Button className="mt-8" size="lg">
			Add To Cart
		</Button>
	);
};

export default AddToCart;
