import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, Button, Stack, Text } from "@mantine/core";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	return (
		<Stack align="center" justify="center" h="100vh" p="xl">
			<Alert
				icon={<HugeiconsIcon icon={Alert01Icon} />}
				title="Something went wrong!"
				color="red"
				variant="light"
			>
				<Stack gap="sm">
					<Text size="sm">{error.message}</Text>
					<Button
						size="sm"
						variant="light"
						onClick={() => window.location.reload()}
					>
						Reload page
					</Button>
				</Stack>
			</Alert>
		</Stack>
	);
}
