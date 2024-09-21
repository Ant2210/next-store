'use client';

import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/toaster';

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Toaster />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
				enableSystem
			>
				{children}
			</ThemeProvider>
		</>
	);
};

export default Providers;
