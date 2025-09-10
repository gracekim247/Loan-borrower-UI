import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<Stack align="center" justify="center" h="100vh" gap="md">
			<Title order={1}>404</Title>
			<Text size="lg">Page not found</Text>
			<Button component={Link} to="/">
				Go home
			</Button>
		</Stack>
	);
}
