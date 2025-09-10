import { ClipboardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProcessingState } from "@krida/proto-client/alexandria";
import {
	AppShell,
	Box,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
	useGetDocument,
	useGetDocumentDownloadUrl,
} from "~/api/document-api";
import { UploadDocumentDropzone } from "~/components/UploadDocumentDropzone";
import { DocumentAnalysis } from "~/components/DocumentAnalysis";

export const Route = createFileRoute(
	"/_authed/application/$applicationId/document/$documentID/$",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { applicationId, documentID } = Route.useParams();
	const documentId = documentID;
	const queryClient = useQueryClient();
	const previousStateRef = useRef<ProcessingState | undefined>(undefined);
	
	const { data: document, isLoading: documentLoading } = useGetDocument(documentId);
	const { data: documentDownloadUrl } = useGetDocumentDownloadUrl(documentId, {
		enabled: document?.state !== ProcessingState.PROCESSING_STATE_PENDING,
	});
	
	// Watch for document state changes and refetch loan application when processing completes
	useEffect(() => {
		if (document?.state) {
			const currentState = document.state;
			const previousState = previousStateRef.current;
			
			if (
				previousState === ProcessingState.PROCESSING_STATE_PROCESSING &&
				currentState === ProcessingState.PROCESSING_STATE_COMPLETED
			) {
				// Document processing completed, refetch loan application to get updated extracted data
				queryClient.invalidateQueries({ queryKey: ["loanApplication", applicationId] });
			}
			
			previousStateRef.current = currentState;
		}
	}, [document?.state, applicationId, queryClient]);
	
	if (documentLoading) {
		return <div>Loading...</div>;
	}
	
	if (!document) {
		return <div>Document not found</div>;
	}
	
	return (
		<AppShell header={{ height: 60 }}>
			<AppShell.Header h={60}>
				<Group
					align="center"
					h={"100%"}
					px="md"
					w="100%"
					justify="space-between"
				>
					<Title order={4}>
						{document.originalFilename || "Document"}
					</Title>
					<Button
						variant="default"
						component={Link}
						to="/upload"
					>
						Close
					</Button>
				</Group>
			</AppShell.Header>
			<AppShell.Main
				style={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box
					pos={"relative"}
					style={{
						flex: "1",
						overflow: "hidden",
					}}
				>
					<Box
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							bottom: 0,
							width: "50%",
							borderRight: "1px solid var(--app-shell-border-color)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						{documentDownloadUrl && document ? (
							<Box
								flex={1}
								style={{ display: "flex", flexDirection: "column" }}
							>
								{document.mimeType?.startsWith("image/") ? (
									<img
										src={documentDownloadUrl}
										width="100%"
										height="100%"
										style={{ objectFit: "contain" }}
										alt="Document"
									/>
								) : document.mimeType === "application/pdf" ? (
									<iframe
										src={documentDownloadUrl}
										width="100%"
										height="100%"
										style={{ border: "none" }}
										title="PDF Viewer"
									/>
								) : (
									<Text c="dimmed">Unsupported file type</Text>
								)}
							</Box>
						) : (
							<Stack flex={1} justify="center" align="center">
								<HugeiconsIcon icon={ClipboardIcon} size={48} />
								<Title order={3}>No Documents Uploaded</Title>
								<Text size="md" c="dimmed">
									Upload documents to get started
								</Text>
							</Stack>
						)}
					</Box>
					<Box
						style={{
							position: "absolute",
							left: "50%",
							top: 0,
							bottom: 0,
							width: "50%",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						<Stack flex={1} p="lg">
							<UploadDocumentDropzone document={document} />
							<Divider />
							<DocumentAnalysis document={document} />
						</Stack>
						<Divider />
						<Group p="lg" justify="flex-end">
							<Button variant="default" disabled={!document?.s3Url}>
								Add Note
							</Button>
							<Button color="dark" disabled={!document?.s3Url}>
								Approve Extraction
							</Button>
						</Group>
					</Box>
				</Box>
			</AppShell.Main>
		</AppShell>
	);
}

