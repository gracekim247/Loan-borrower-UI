import { useUser } from "@clerk/tanstack-react-start";
import { Loader } from "@mantine/core";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return <Loader />;
	}

	if (user) {
		// User is authenticated, redirect to dashboard
		return <Navigate to="/dashboard" />;
	}

	// User is not authenticated, redirect to sign-in
	return <Navigate to="/signin" />;
}
