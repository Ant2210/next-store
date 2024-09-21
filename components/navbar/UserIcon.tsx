/* eslint-disable @next/next/no-img-element */
import { LuUser2 } from 'react-icons/lu';
import {
	currentUser,
	// auth
} from '@clerk/nextjs/server';

const UserIcon = async () => {
	// const {userId} = auth();

	const user = await currentUser();

	const profileImage = user?.imageUrl;

	if (profileImage) {
		return (
			<img
				src={profileImage}
				alt="Profile image"
				className="w-6 h-6 rounded-full object-cover"
			/>
		);
	}

	return <LuUser2 className="w-6 h-6 bg-primary rounded-full text-white" />;
};

export default UserIcon;
