import {
	useOrganization,
	useSignIn,
	useSignUp,
} from "@clerk/tanstack-react-start";
import {
	Alert01Icon,
	CheckmarkCircle01Icon,
	Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Alert,
	Avatar,
	Button,
	Card,
	Container,
	Group,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

interface InvitationSearchParams {
	applicationId?: string;
	__clerk_ticket?: string;
	__clerk_status?: string;
	borrowerName?: string;
}

const signUpSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const Route = createFileRoute("/_authed/accept-invitation")({
	validateSearch: (search: Record<string, unknown>): InvitationSearchParams => {
		return {
			applicationId:
				typeof search.applicationId === "string"
					? search.applicationId
					: undefined,
			__clerk_ticket:
				typeof search.__clerk_ticket === "string"
					? search.__clerk_ticket
					: undefined,
			__clerk_status:
				typeof search.__clerk_status === "string"
					? search.__clerk_status
					: undefined,
			borrowerName:
				typeof search.borrowerName === "string"
					? search.borrowerName
					: undefined,
		}
	},
	component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
	const { applicationId, __clerk_ticket, __clerk_status, borrowerName } =
		Route.useSearch();
	const navigate = useNavigate();
	const {
		isLoaded: signUpLoaded,
		signUp,
		setActive: setActiveSignUp,
	} = useSignUp();
	const { signIn, setActive: setActiveSignIn } = useSignIn();
	const { organization } = useOrganization();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Parse borrower name from URL params
	const nameParts = borrowerName ? borrowerName.split(" ") : [];
	const firstName = nameParts[0] || "";
	const lastName = nameParts.slice(1).join(" ") || "";

	const form = useForm({
		initialValues: {
			firstName,
			lastName,
			password: "",
		},
		validate: zodResolver(signUpSchema),
	})

	// Handle sign-in for existing users
	useEffect(() => {
		if (
			!signIn ||
			!setActiveSignIn ||
			!__clerk_ticket ||
			organization ||
			__clerk_status !== "sign_in"
		) {
			return
		}

		const createSignIn = async () => {
			try {
				setLoading(true);

				// Create a new `SignIn` with the supplied invitation token.
				const signInAttempt = await signIn.create({
					strategy: "ticket",
					ticket: __clerk_ticket,
				})

				// If the sign-in was successful, set the session to active
				if (signInAttempt.status === "complete") {
					await setActiveSignIn({
						session: signInAttempt.createdSessionId,
					})

					// Store application context
					if (applicationId) {
						sessionStorage.setItem("pendingApplicationId", applicationId);
					}

					// Navigate to dashboard
					navigate({ to: "/dashboard" });
				} else {
					console.error("Sign-in not complete:", signInAttempt);
					setError("Failed to sign in. Please try again.");
				}
				// biome-ignore lint/suspicious/noExplicitAny: error typing
			} catch (err: any) {
				console.error("Sign-in error:", err);
				setError("Failed to sign in. Please try again.");
			} finally {
				setLoading(false);
			}
		}

		createSignIn();
	}, [
		signIn,
		setActiveSignIn,
		__clerk_ticket,
		organization,
		__clerk_status,
		applicationId,
		navigate,
	])

	// Handle sign-up form submission
	const handleSignUp = async (values: typeof form.values) => {
		if (!signUpLoaded || !signUp || !setActiveSignUp) return;

		try {
			setLoading(true);
			setError(null);

			// Create a new sign-up with the supplied invitation token.
			const signUpAttempt = await signUp.create({
				strategy: "ticket",
				ticket: __clerk_ticket,
				firstName: values.firstName,
				lastName: values.lastName,
				password: values.password,
			})

			// If the sign-up was successful, set the session to active
			if (signUpAttempt.status === "complete") {
				await setActiveSignUp({ session: signUpAttempt.createdSessionId });

				// Store application context
				if (applicationId) {
					sessionStorage.setItem("pendingApplicationId", applicationId);
				}

				// Navigate to dashboard
				navigate({ to: "/dashboard" });
			} else {
				console.error("Sign-up not complete:", signUpAttempt);
				setError("Sign-up not complete. Please try again.");
			}
			// biome-ignore lint/suspicious/noExplicitAny: error typing
		} catch (err: any) {
			console.error("Sign-up error:", err);
			setError(
				err.errors?.[0]?.message ||
					"Failed to create account. Please try again.",
			)
		} finally {
			setLoading(false);
		}
	}

	// If there is no invitation token, restrict access to this page
	if (!__clerk_ticket) {
		return (
			<Container size="sm" py="xl">
				<Alert
					icon={<HugeiconsIcon icon={Alert01Icon} />}
					title="Invalid Invitation"
					color="red"
				>
					<Text>
						No invitation token found. Please check your invitation link.
					</Text>
				</Alert>
			</Container>
		)
	}
	// Show loading for existing user sign-in
	if (__clerk_status === "sign_in" && !organization) {
		return (
			<Container size="sm" py="xl">
				<Stack align="center" gap="md">
					<Title order={2}>Signing you in...</Title>
					<Text>Please wait while we sign you in to your account.</Text>
				</Stack>
			</Container>
		)
	}

	// Show sign-up form for new users
	if (__clerk_status === "sign_up" && !organization) {
		return (
			<Container size="sm" py="xl">
				<Stack align="center" gap="xl">
					<Group>
						<Avatar size="lg" />
						<Stack gap="xs">
							<Title order={2}>Complete Your Registration</Title>
							<Text size="lg" c="dimmed">
								You've been invited to access your loan application
							</Text>
						</Stack>
					</Group>

					<Card withBorder padding="xl" radius="md" w="100%">
						<form onSubmit={form.onSubmit(handleSignUp)}>
							<Stack gap="md">
								<Group>
									<HugeiconsIcon icon={Mail01Icon} />
									<Text fw={500}>Complete Your Account</Text>
								</Group>

								{applicationId && (
									<Text size="sm" c="blue">
										Application ID: {applicationId}
									</Text>
								)}

								{borrowerName && (
									<Text size="sm" c="dimmed">
										Welcome, {borrowerName}!
									</Text>
								)}

								<Group grow>
									<TextInput
										label="First Name"
										placeholder="John"
										{...form.getInputProps("firstName")}
										required
									/>
									<TextInput
										label="Last Name"
										placeholder="Doe"
										{...form.getInputProps("lastName")}
										required
									/>
								</Group>

								<PasswordInput
									label="Password"
									placeholder="Create a strong password"
									{...form.getInputProps("password")}
									required
								/>

								{error && (
									<Alert
										color="red"
										icon={<HugeiconsIcon icon={Alert01Icon} />}
									>
										{error}
									</Alert>
								)}

								<Button
									type="submit"
									size="lg"
									fullWidth
									loading={loading}
									leftSection={<HugeiconsIcon icon={CheckmarkCircle01Icon} />}
								>
									Complete Registration
								</Button>
								<div id="clerk-captcha" />
							</Stack>
						</form>
					</Card>

					<Text size="sm" ta="center" c="dimmed">
						Your email address has been automatically verified through the
						invitation.
					</Text>
				</Stack>
			</Container>
		)
	}

	// Success state - organization invitation accepted
	return (
		<Container size="sm" py="xl">
			<Stack align="center" gap="xl">
				<HugeiconsIcon icon={CheckmarkCircle01Icon} size={64} color="green" />
				<Stack align="center" gap="md">
					<Title order={2}>Invitation Accepted!</Title>
					<Text ta="center" c="dimmed">
						You have successfully joined the organization and can now access
						your loan application.
					</Text>
				</Stack>
				<Button onClick={() => navigate({ to: "/dashboard" })}>
					Go to Dashboard
				</Button>
			</Stack>
		</Container>
	)
}
