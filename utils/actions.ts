'use server';

import db from '@/utils/db';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import {
	imageSchema,
	productSchema,
	reviewSchema,
	validateWithZodSchema,
} from './schema';
import { deleteImage, uploadImage } from './supabase';
import { revalidatePath } from 'next/cache';

const getAuthUser = async () => {
	const user = await currentUser();
	if (!user) redirect('/');
	return user;
};

const getAminUser = async () => {
	const user = await getAuthUser();
	if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
	return user;
};

const renderError = (error: unknown): { message: string } => {
	console.log(error);
	return {
		message: error instanceof Error ? error.message : 'There was an error. ',
	};
};

export const fetchFeaturedProducts = async () => {
	const products = await db.product.findMany({
		where: {
			featured: true,
		},
	});
	return products;
};

export const fetchAllProducts = async ({ search = '' }: { search: string }) => {
	const products = await db.product.findMany({
		where: {
			OR: [
				{ name: { contains: search, mode: 'insensitive' } },
				{ company: { contains: search, mode: 'insensitive' } },
			],
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	return products;
};

export const fetchSingleProduct = async (productId: string) => {
	const product = await db.product.findUnique({
		where: {
			id: productId,
		},
	});
	if (!product) redirect('/products');
	return product;
};

export const createProductAction = async (
	prevState: unknown,
	formData: FormData,
): Promise<{ message: string }> => {
	const user = await getAuthUser();

	try {
		const rawData = Object.fromEntries(formData);
		const file = formData.get('image') as File;
		const validatedFields = validateWithZodSchema(productSchema, rawData);
		const validatedFile = validateWithZodSchema(imageSchema, { image: file });
		const fullPath = await uploadImage(validatedFile.image);

		await db.product.create({
			data: {
				...validatedFields,
				image: fullPath,
				clerkId: user.id,
			},
		});
	} catch (error) {
		return renderError(error);
	}
	redirect('/admin/products');
};

export const fetchAdminProducts = async () => {
	await getAminUser();
	const products = await db.product.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});
	return products;
};

export const deleteProductAction = async (prevState: { productId: string }) => {
	const { productId } = prevState;
	await getAminUser();
	try {
		const product = await db.product.delete({
			where: {
				id: productId,
			},
		});
		await deleteImage(product.image);
		revalidatePath('admin/products');
		return { message: 'Product removed.' };
	} catch (error) {
		return renderError(error);
	}
};

export const fetchAdminProductDetails = async (productId: string) => {
	await getAminUser();
	const product = await db.product.findUnique({
		where: {
			id: productId,
		},
	});
	if (!product) redirect('/admin/products');
	return product;
};

export const updateProductAction = async (
	prevState: unknown,
	formData: FormData,
) => {
	await getAminUser();

	try {
		const productId = formData.get('id') as string;
		const rawData = Object.fromEntries(formData);
		const validatedFields = validateWithZodSchema(productSchema, rawData);

		await db.product.update({
			where: {
				id: productId,
			},
			data: {
				...validatedFields,
			},
		});

		revalidatePath(`/admin/products/${productId}/edit`);
		return { message: 'Product updated successfully.' };
	} catch (error) {
		return renderError(error);
	}
};

export const updateProductImageAction = async (
	prevState: unknown,
	formData: FormData,
) => {
	await getAminUser();

	try {
		const image = formData.get('image') as File;
		const productId = formData.get('id') as string;
		const oldImageUrl = formData.get('url') as string;

		const validatedFile = validateWithZodSchema(imageSchema, { image });
		const fullPath = await uploadImage(validatedFile.image);

		await deleteImage(oldImageUrl);
		await db.product.update({
			where: {
				id: productId,
			},
			data: {
				image: fullPath,
			},
		});
		revalidatePath(`/admin/products/${productId}/edit`);
		return { message: 'Product image updated successfully.' };
	} catch (error) {
		return renderError(error);
	}
};

export const fetchFavouriteId = async ({
	productId,
}: {
	productId: string;
}) => {
	const user = await getAuthUser();
	const favourite = await db.favourite.findFirst({
		where: {
			productId,
			clerkId: user.id,
		},
		select: {
			id: true,
		},
	});
	return favourite?.id || null;
};

export const toggleFavouriteAction = async (prevState: {
	productId: string;
	favouriteId: string | null;
	pathname: string;
}) => {
	const user = await getAuthUser();
	const { productId, favouriteId, pathname } = prevState;

	try {
		if (favouriteId) {
			await db.favourite.delete({
				where: {
					id: favouriteId,
				},
			});
		} else {
			await db.favourite.create({
				data: {
					productId,
					clerkId: user.id,
				},
			});
		}
		revalidatePath(pathname);
		return {
			message: favouriteId
				? 'Removed from favourites.'
				: 'Added to favourites.',
		};
	} catch (error) {
		return renderError(error);
	}
};

export const fetchUserFavourites = async () => {
	const user = await getAuthUser();
	const favourites = await db.favourite.findMany({
		where: {
			clerkId: user.id,
		},
		include: {
			product: true,
		},
	});
	return favourites;
};

export const createReviewAction = async (
	prevState: unknown,
	formData: FormData,
) => {
	const user = await getAuthUser();

	try {
		const rawData = Object.fromEntries(formData);
		const validatedFields = validateWithZodSchema(reviewSchema, rawData);
		await db.review.create({
			data: {
				...validatedFields,
				clerkId: user.id,
			},
		});
		revalidatePath(`/products/${validatedFields.productId}`);
		return { message: 'Review submitted successfully.' };
	} catch (error) {
		return renderError(error);
	}
};

export const fetchProductReviews = async (productId: string) => {
	const reviews = await db.review.findMany({
		where: {
			productId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	return reviews;
};

export const fetchProductRating = async (productId: string) => {
	const result = await db.review.groupBy({
		by: ['productId'],
		_avg: {
			rating: true,
		},
		_count: {
			rating: true,
		},
		where: { productId },
	});
	return {
		rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
		count: result[0]?._count.rating ?? 0,
	};
};

export const fetchProductReviewsByUser = async () => {
	const user = await getAuthUser();
	const reviews = await db.review.findMany({
		where: {
			clerkId: user.id,
		},
		select: {
			id: true,
			rating: true,
			comment: true,
			product: {
				select: {
					image: true,
					name: true,
				},
			},
		},
	});
	return reviews;
};

export const deleteReviewAction = async (prevState: { reviewId: string }) => {
	const { reviewId } = prevState;
	const user = await getAuthUser();

	try {
		await db.review.delete({
			where: {
				id: reviewId,
				clerkId: user.id,
			},
		});
		revalidatePath('/reviews');
		return { message: 'Review deleted successfully.' };
	} catch (error) {
		return renderError(error);
	}
};

export const findExistingReview = async (userId: string, productId: string) => {
	return db.review.findFirst({
		where: {
			clerkId: userId,
			productId,
		},
	});
};
