import { Stack, Text, Title, Badge } from "@mantine/core";
import { Document } from "@krida/proto-client/alexandria";

interface DocumentAnalysisProps {
	document: Document;
}

export const DocumentAnalysis = ({ document }: DocumentAnalysisProps) => {
	return (
		<Stack>
			<Title order={5}>Document Analysis</Title>
			<Stack gap="xs">
				<Text size="sm">
					<strong>Document ID:</strong> {document.id}
				</Text>
				<Stack gap={4}>
					<Text size="sm">
						<strong>Processing Status:</strong>
					</Text>
					<Badge 
						color={
							document.state === 3 ? "green" : 
							document.state === 2 ? "yellow" : 
							document.state === 4 ? "red" : "gray"
						}
						variant="light"
						w="fit-content"
					>
						{document.state === 1 ? "Pending" :
						 document.state === 2 ? "Processing" :
						 document.state === 3 ? "Completed" :
						 document.state === 4 ? "Failed" : "Unknown"}
					</Badge>
				</Stack>
				{document.rawMetadata && (
					<Text size="sm">
						<strong>Extracted Data:</strong> Available
					</Text>
				)}
				{!document.rawMetadata && document.state === 3 && (
					<Text size="sm" c="dimmed">
						No extracted data available for this document type
					</Text>
				)}
			</Stack>
		</Stack>
	);
};

