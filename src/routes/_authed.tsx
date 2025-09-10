import {
	SignIn,
	useOrganizationList,
	useUser,
} from "@clerk/tanstack-react-start";
import { Loader, Text } from "@mantine/core";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import classes from "./_authed.module.css";

export const Route = createFileRoute("/_authed")({
	component: AuthGuard,
});

function AuthGuard() {
	const { user } = useUser();

	const { isLoaded, setActive, userMemberships } = useOrganizationList({
		userMemberships: true,
	});

	// Set active organization only once when data is loaded
	useEffect(() => {
		if (
			isLoaded &&
			!userMemberships.isLoading &&
			userMemberships.data.length > 0 &&
			!userMemberships.data[0].organization
		) {
			setActive({ organization: userMemberships.data[0].organization });
		}
	}, [isLoaded, userMemberships.isLoading, userMemberships.data, setActive]);

	if (!user) {
		return <Welcome />;
	}
	if (!isLoaded || userMemberships.isLoading) {
		return <Loader />;
	}
	if (userMemberships.data.length === 0) {
		return <NoOrganization />;
	}

	return <Outlet />;
}

function Welcome() {
	return (
		<div className={classes.welcomeContainer}>
			<SignIn />
		</div>
	);
}

function NoOrganization() {
	return (
		<div className={classes.welcomeContainer}>
			<Text size="xl" fw={500}>
				You have no organization memberships. Please contact an administrator
				for assistance.
			</Text>
		</div>
	);
}
