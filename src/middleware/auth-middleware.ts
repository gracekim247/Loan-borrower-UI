import {
	clerkClient,
	getAuth,
	type User,
} from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest, setResponseStatus } from "@tanstack/react-start/server";

export const userAuthContextMiddleware = createMiddleware({
	type: "function",
}).server<{
	user: User | undefined;
}>(async ({ next }) => {
	const webRequest = getWebRequest();
	if (!webRequest) {
		setResponseStatus(401);
		return next({
			context: {
				user: undefined as User | undefined,
			},
		});
	}
	const { userId } = await getAuth(webRequest);
	if (!userId) {
		setResponseStatus(401);
		return next({
			context: {
				user: undefined as User | undefined,
			},
		});
	}
	// Instantiate the Backend SDK
	const clerkClientInstance = clerkClient({
		secretKey: process.env.CLERK_SECRET_KEY,
	});

	// Get the user's full `Backend User` object
	const user = await clerkClientInstance.users.getUser(userId);

	return next({
		context: {
			user: user as User | undefined,
		},
	});
});

export const userAuthOrganizationMiddleware = createMiddleware({
	type: "function",
}).server<{ orgSlug: string; orgId: string }>(async ({ next }) => {
	const webRequest = getWebRequest();
	if (!webRequest) {
		setResponseStatus(401);
		return next({
			context: {
				orgSlug: "",
				orgId: "",
			},
		});
	}
	const { orgSlug, orgId } = await getAuth(webRequest);
	if (!orgSlug || !orgId) {
		setResponseStatus(401);
		return next({
			context: {
				orgSlug: "",
				orgId: "",
			},
		});
	}
	return next({
		context: {
			orgSlug: orgSlug,
			orgId: orgId,
		},
	});
});

