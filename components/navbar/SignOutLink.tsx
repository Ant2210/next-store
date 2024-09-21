'use client';

import { useToast } from '@/components/ui/use-toast';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

const SignOutLink = () => {
	const { toast } = useToast();
	const handleLogout = () => {
		toast({
			description: 'Logout Successful',
		});
	};

	return (
		<SignOutButton>
			<Link
				href="/"
				className="w-full text-left py-[6px] px-2"
				onClick={handleLogout}
			>
				Logout
			</Link>
		</SignOutButton>
	);
};

export default SignOutLink;
