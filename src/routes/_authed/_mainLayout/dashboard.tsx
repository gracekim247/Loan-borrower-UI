import { useOrganization, useUser } from "@clerk/tanstack-react-start";
import { useHeader } from "../_mainLayout";
import {
	Alert01Icon,
	BuildingIcon,
	CheckmarkCircle01Icon,
	Clock01Icon,
	File02Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Avatar,
	Badge,
	Button,
	Card,
	Grid,
	Group,
	Progress,
	Stack,
	Text,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authed/_mainLayout/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useUser();
	const { organization } = useOrganization();
	const { setHeaderContent, clearHeaderContent } = useHeader();

	// Get application ID from user metadata (stored during signup)
	const applicationId =
		(user?.publicMetadata?.applicationId as string) || "N/A";

	// Mock application data - in real app, this would come from your backend
	const applicationData = {
		id: applicationId,
		status: "in_progress",
		completionPercentage: 30,
		documentsUploaded: 2,
		documentsRequired: 7,
		lastUpdated: "2025-01-10",
		loanOfficer: {
			name: "Sarah Johnson",
			email: "sarah.johnson@bank.com",
		},
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "in_progress":
				return "blue";
			case "under_review":
				return "yellow";
			case "approved":
				return "green";
			case "rejected":
				return "red";
			default:
				return "gray";
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case "in_progress":
				return "In Progress";
			case "under_review":
				return "Under Review";
			case "approved":
				return "Approved";
			case "rejected":
				return "Rejected";
			default:
				return "Unknown";
		}
	}

	// Set the dashboard header content
	useEffect(() => {
		const headerContent = (
			<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
				<h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
					Welcome back, {user?.firstName || 'User'}!
				</h2>
				<p style={{ margin: 0, color: "#6c757d", fontSize: "1rem" }}>
					{organization?.name
						? `Managing your application with ${organization.name}`
						: "Loan Application Portal"}
				</p>
			</div>
		);
		
		setHeaderContent(headerContent);
		
		// Clean up when component unmounts
		return () => {
			clearHeaderContent();
		};
	}, [user, organization, setHeaderContent, clearHeaderContent]);
    
	return (
        <Stack gap="xl">
            {/* Application Status Card */}
            <Card withBorder padding="xl" radius="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group>
                            <HugeiconsIcon icon={File02Icon} size={24} />
                            <Stack gap="xs">
                                <Text fw={500} size="lg">
                                    Loan Application
                                </Text>
                                <Text size="sm" c="dimmed">
                                    ID: {applicationData.id}
                                </Text>
                            </Stack>
                        </Group>
                        <Badge
                            color={getStatusColor(applicationData.status)}
                            variant="light"
                            size="lg"
                        >
                            {getStatusText(applicationData.status)}
                        </Badge>
                    </Group>

                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>
                                Application Progress
                            </Text>
                            <Text size="sm" c="dimmed">
                                {applicationData.completionPercentage}% Complete
                            </Text>
                        </Group>
                        <Progress
                            value={applicationData.completionPercentage}
                            color={getStatusColor(applicationData.status)}
                            size="lg"
                            radius="md"
                        />
                    </Stack>

                    <Text size="sm" c="dimmed">
                        Last updated: {applicationData.lastUpdated}
                    </Text>
                </Stack>
            </Card>

            {/* Quick Actions */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Card withBorder padding="lg" radius="md" h="100%">
                        <Stack gap="md" align="center">
                            <HugeiconsIcon icon={File02Icon} size={32} color="blue" />
                            <Stack gap="xs" align="center">
                                <Text fw={500}>Documents</Text>
                                <Text size="sm" ta="center" c="dimmed">
                                    {applicationData.documentsUploaded} of{" "}
                                    {applicationData.documentsRequired} uploaded
                                </Text>
                            </Stack>
                            <Button variant="light" fullWidth component={Link} to="/upload">
                                Upload Documents
                            </Button>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Card withBorder padding="lg" radius="md" h="100%">
                        <Stack gap="md" align="center">
                            <HugeiconsIcon icon={UserIcon} size={32} color="green" />
                            <Stack gap="xs" align="center">
                                <Text fw={500}>Personal Information</Text>
                                <Text size="sm" ta="center" c="dimmed">
                                    Complete your application forms
                                </Text>
                            </Stack>
                            <Button variant="light" fullWidth>
                                Update Information
                            </Button>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Next Steps */}
            <Card withBorder padding="xl" radius="md">
                <Stack gap="md">
                    <Group>
                        <HugeiconsIcon icon={Clock01Icon} />
                        <Text fw={500} size="lg">
                            Next Steps
                        </Text>
                    </Group>

                    <Stack gap="sm">
                        <Group>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} color="green" />
                            <Text size="sm">Account created and verified</Text>
                        </Group>
                        <Group>
                            <HugeiconsIcon icon={Alert01Icon} color="orange" />
                            <Text size="sm">
                                Upload required documents (2 of 7 completed)
                            </Text>
                        </Group>
                        <Group>
                            <HugeiconsIcon icon={Clock01Icon} color="gray" />
                            <Text size="sm" c="dimmed">
                                Complete personal information forms
                            </Text>
                        </Group>
                        <Group>
                            <HugeiconsIcon icon={Clock01Icon} color="gray" />
                            <Text size="sm" c="dimmed">
                                Submit application for review
                            </Text>
                        </Group>
                    </Stack>
                </Stack>
            </Card>

            {/* Loan Officer Contact */}
            <Card withBorder padding="xl" radius="md">
                <Stack gap="md">
                    <Group>
                        <HugeiconsIcon icon={BuildingIcon} />
                        <Text fw={500} size="lg">
                            Your Loan Officer
                        </Text>
                    </Group>

                    <Group>
                        <Avatar size="md" />
                        <Stack gap="xs">
                            <Text fw={500}>{applicationData.loanOfficer.name}</Text>
                            <Text size="sm" c="dimmed">
                                {applicationData.loanOfficer.email}
                            </Text>
                        </Stack>
                    </Group>

                    <Button variant="outline">Contact Loan Officer</Button>
                </Stack>
            </Card>
        </Stack>
	)
}
