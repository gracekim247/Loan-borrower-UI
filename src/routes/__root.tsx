/// <reference types="vite/client" />

import { ClerkProvider, useOrganization } from "@clerk/tanstack-react-start";
import {
	ColorSchemeScript,
	Loader,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";
import mantineCssUrl from "@mantine/core/styles.css?url";
import mantineDatesCssUrl from "@mantine/dates/styles.css?url";
import mantineDropzoneCssUrl from "@mantine/dropzone/styles.css?url";
import mantineNotificationsCssUrl from "@mantine/notifications/styles.css?url";
import mantineSpotlightCssUrl from "@mantine/spotlight/styles.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { borrowerTheme } from "~/styles/theme";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: (failureCount, error: any) => {
				// Don't retry on rate limiting errors
				if (error?.status === 429) {
					return false;
				}
				// Retry up to 2 times for other errors
				return failureCount < 2;
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
			{ rel: "stylesheet", href: mantineCssUrl },
			{ rel: "stylesheet", href: mantineDatesCssUrl },
			{ rel: "stylesheet", href: mantineDropzoneCssUrl },
			{ rel: "stylesheet", href: mantineNotificationsCssUrl },
			{ rel: "stylesheet", href: mantineSpotlightCssUrl },
			// inter font
			{ rel: "preconnect", href: "https://rsms.me/" },
			{ rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
		],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<ClerkProvider>
			<QueryClientProvider client={queryClient}>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</QueryClientProvider>
		</ClerkProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { isLoaded } = useOrganization();
	return (
		<html {...mantineHtmlProps}>
			<head>
				<HeadContent />
				<ColorSchemeScript nonce="8IBTHwOdqNKAWeKl7plt8g==" />
			</head>
			<body>
				<MantineProvider theme={borrowerTheme}>
					{isLoaded ? (
						children
					) : (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100vh",
							}}
						>
							<Loader size={"xl"} />
						</div>
					)}

					<TanStackRouterDevtools position="bottom-right" />
					<Scripts />
				</MantineProvider>
			</body>
		</html>
	);
}
