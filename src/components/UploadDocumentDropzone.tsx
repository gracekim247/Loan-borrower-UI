import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Paper, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { Document } from "@krida/proto-client/alexandria";
import { useUploadDocument } from "~/api/document-api";

export const UploadDocumentDropzone = (props: { document: Document }) => {
	const uploadDocument = useUploadDocument();
	return (
		<Dropzone
			onDrop={(files) => {
				const file = files[0];
				const payload = new FormData();
				payload.append("loanApplicationId", props.document.loanApplicationId);
				payload.append("file", file);
				payload.append("documentId", props.document.id);
				uploadDocument.mutate({
					data: payload,
				});
			}}
			style={{}}
			styles={{
				inner: {
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					gap: "var(--mantine-spacing-xs)",
				},
			}}
		>
			<Paper
				withBorder
				h={"fit-content"}
				w={"fit-content"}
				p={"xs"}
				radius="md"
				style={{
					aspectRatio: "1/1",
				}}
			>
				<HugeiconsIcon icon={CloudUploadIcon} />
			</Paper>
			<Text size="sm">
				<b>Click to upload</b> or drag and drop
			</Text>
		</Dropzone>
	);
};

