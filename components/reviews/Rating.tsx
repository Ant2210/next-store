import { FaStar, FaRegStar } from 'react-icons/fa';

const Rating = ({ rating }: { rating: number }) => {
	// rating = 2
	// 1 <= 2 true
	// 2 <= 2 true
	// 3 <= 2 false
	// 4 <= 2 false
	// 5 <= 2 false
	// For a rating of 2 we return 2 trues and 3 false

	const stars = Array.from({ length: 5 }, (_, index) => index + 1 <= rating);

	return (
		<div className="flex items-center gap-x-1">
			{stars.map((isFilled, index) => {
				const className = `w-3 h-3 ${
					isFilled ? 'text-primary' : 'text-grey-400'
				}`;
				return isFilled ? (
					<FaStar className={className} key={index} />
				) : (
					<FaRegStar className={className} key={index} />
				);
			})}
		</div>
	);
};

export default Rating;
