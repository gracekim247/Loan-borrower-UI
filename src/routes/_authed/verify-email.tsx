import { useClerk, useUser } from "@clerk/tanstack-react-start";
import {
	Alert01Icon,
	CheckmarkCircle01Icon,
	Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Alert,
	Button,
	Card,
	Container,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface VerifyEmailSearchParams {
	__clerk_ticket?: string;
}

export const Route = createFileRoute("/_authed/verify-email")({
	validateSearch: (
		search: Record<string, unknown>,
	): VerifyEmailSearchParams => {
		return {
			__clerk_ticket:
				typeof search.__clerk_ticket === "string"
					? search.__clerk_ticket
					: undefined,
		}
	},
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	const { __clerk_ticket } = Route.useSearch();
	const navigate = useNavigate();
	const { handleEmailLinkVerification } = useClerk();
	const { user } = useUser();
	const [loading, setLoading] = useState(true);
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const verifyEmail = async () => {
			if (!__clerk_ticket) {
				setError("Invalid verification link");
				setLoading(false);
				return
			}

			try {
				setLoading(true);

				// Handle the email verification
				const result = await handleEmailLinkVerification({
					redirectUrl: window.location.href,
					redirectUrlComplete: "/dashboard",
				})

				// biome-ignore lint/suspicious/noExplicitAny: false positive
				if ((result as any)?.status === "complete") {
					setVerified(true);

					// Small delay before redirect to show success
					setTimeout(() => {
						navigate({ to: "/dashboard" });
					}, 2000)
				}
				// biome-ignore lint/suspicious/noExplicitAny: false positive
			} catch (err: any) {
				console.error("Email verification error:", err);
				setError(
					err.errors?.[0]?.message ||
						"Failed to verify email. The link may be expired.",
				)
			} finally {
				setLoading(false);
			}
		}

		verifyEmail();
	}, [__clerk_ticket, handleEmailLinkVerification, navigate]);

	if (loading) {
		return (
			<Container size="sm" py="xl">
				<Stack align="center" gap="md">
					<HugeiconsIcon icon={Mail01Icon} size={48} />
					<Title order={2}>Verifying Your Email...</Title>
					<Text ta="center" c="dimmed">
						Please wait while we verify your email address.
					</Text>
				</Stack>
			</Container>
		)
	}

	if (verified) {
		return (
			<Container size="sm" py="xl">
				<Stack align="center" gap="xl">
					<HugeiconsIcon icon={CheckmarkCircle01Icon} size={64} color="green" />

					<Stack align="center" gap="md">
						<Title order={2}>Email Verified!</Title>
						<Text ta="center" c="dimmed">
							Your email has been successfully verified. You're being redirected
							to your dashboard.
						</Text>
					</Stack>

					<Card withBorder padding="xl" radius="md" w="100%">
						<Stack gap="md" align="center">
							<Text fw={500}>
								Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
							</Text>
							<Text size="sm" ta="center">
								Your account is now active and you can access your loan
								application.
							</Text>

							<Button
								onClick={() => navigate({ to: "/dashboard" })}
								leftSection={<HugeiconsIcon icon={CheckmarkCircle01Icon} />}
							>
								Go to Dashboard
							</Button>
						</Stack>
					</Card>
				</Stack>
			</Container>
		)
	}

	if (error) {
		return (
			<Container size="sm" py="xl">
				<Alert
					icon={<HugeiconsIcon icon={Alert01Icon} />}
					title="Verification Failed"
					color="red"
				>
					<Stack gap="sm">
						<Text>{error}</Text>
						<Group gap="sm">
							{/* <Button
								variant="light"
								onClick={() => navigate({ to: "/signup" })}
							>
								Try Signing Up Again
							</Button> */}
							<Button variant="outline" onClick={() => navigate({ to: "/" })}>
								Go to Home
							</Button>
						</Group>
					</Stack>
				</Alert>
			</Container>
		)
	}

	return null;
}
