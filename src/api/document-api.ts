import { DocumentKind, ProcessingState } from "@krida/proto-client/alexandria";
import {
	alexandriaServiceClient,
	gangaServiceClient,
} from "@krida/proto-client/clients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	userAuthContextMiddleware,
	userAuthOrganizationMiddleware,
} from "~/middleware/auth-middleware";

const uploadDocument = createServerFn({
	method: "POST",
})
	.validator(z.instanceof(FormData))
	.middleware([userAuthContextMiddleware, userAuthOrganizationMiddleware])
	.handler(async ({ data, context }) => {
		if (!(data instanceof FormData)) {
			throw new Error("Input not instance of FormData");
		}
		const loanApplicationId = data.get("loanApplicationId") as string;
		const documentId = data.get("documentId") as string;
		const file = data.get("file") as File;
		
		// If documentId is empty, create a real document first
		let realDocumentId = documentId;
		if (documentId==='') {
			// Create a new document with a real UUID
			const createResponse = await alexandriaServiceClient.createDocument({
				kind: DocumentKind.DOCUMENT_KIND_CUSTOM,
				loanApplicationId: loanApplicationId,
				ownerUserId: context.user?.id || "",
				bankName: context.orgSlug,
				description: `Uploaded document: ${file.name}`,
			});
			realDocumentId = createResponse.documentId;
		}
		
		const s3PutUrl = await alexandriaServiceClient.generatePresignedUrl({
			loanApplicationId: loanApplicationId,
			orgName: context.orgSlug,
			originalFilename: file.name,
			mimeType: file.type,
		});
		await fetch(s3PutUrl.presignedUrl, {
			method: "PUT",
			body: file,
		});
		await alexandriaServiceClient.uploadDocument({
			documentId: realDocumentId,
			originalFilename: file.name,
			mimeType: file.type,
			loanApplicationId: loanApplicationId,
			ownerUserId: context.user?.id || "",
			bankName: context.orgSlug,
			s3Key: s3PutUrl.s3Key,
		});
		await alexandriaServiceClient.processDocument({
			documentId: realDocumentId,
		});
		return { ...s3PutUrl, documentId: realDocumentId };
	});

export const useUploadDocument = () => {
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: uploadDocument,
		onSuccess: (response: any, variables) => {
			const originalDocumentId = variables.data.get("documentId") as string;
			const loanApplicationId = variables.data.get("loanApplicationId") as string;
			const realDocumentId = response.documentId;
			
			// Invalidate document queries to trigger polling and refresh data
			queryClient.invalidateQueries({ queryKey: ["document", realDocumentId] });
			queryClient.invalidateQueries({ queryKey: ["document-download-url", realDocumentId] });
			queryClient.invalidateQueries({ queryKey: ["loanApplication", loanApplicationId] });
			
			// Also invalidate any document list queries for the loan application
			queryClient.invalidateQueries({ queryKey: ["documents", loanApplicationId] });
		},
	});
};

const getDocumentSchema = z.object({
	documentId: z.string(),
});
export const getDocument = createServerFn({
	method: "GET",
})
	.validator(getDocumentSchema)
	.handler(async ({ data }) => {
		const response = await alexandriaServiceClient.getDocument({
			documentId: data.documentId,
		});
		return response.document;
	});

export const useGetDocument = (documentId: string) => {
	return useQuery({
		queryKey: ["document", documentId],
		queryFn: () => getDocument({ data: { documentId } }),
		refetchInterval: (query) => {
			// Poll every 2 seconds if processing, otherwise don't poll
			return query.state?.data?.state === ProcessingState.PROCESSING_STATE_PROCESSING ? 2000 : false;
		},
		refetchIntervalInBackground: true,
	});
};

// --- Download URL server function and hook ---
const getDocumentDownloadUrlSchema = z.object({
	documentId: z.string(),
});

export const getDocumentDownloadUrl = createServerFn({
	method: "GET",
})
	.validator(getDocumentDownloadUrlSchema)
	.handler(async ({ data }) => {
		const response = await alexandriaServiceClient.generateDownloadUrl({
			documentId: data.documentId,
		});
		return response.presignedUrl;
	});

export const useGetDocumentDownloadUrl = (documentId: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["document-download-url", documentId],
		queryFn: () => getDocumentDownloadUrl({ data: { documentId } }),
		enabled: !!documentId && (options?.enabled !== false),
	});
};

// --- Get documents for a loan application ---
const getDocumentsForLoanApplicationSchema = z.object({
	loanApplicationId: z.string(),
});

export const getDocumentsForLoanApplication = createServerFn({
	method: "GET",
})
	.validator(getDocumentsForLoanApplicationSchema)
	.handler(async ({ data }) => {
		const response = await alexandriaServiceClient.listDocumentsByLoanApplication({
			loanApplicationId: data.loanApplicationId,
			pagingInfo: {
				pageSize: 100, // Get all documents
				pageNum: 0,
			},
		});
		return response.documents;
	});

export const useGetDocumentsForLoanApplication = (loanApplicationId: string) => {
	return useQuery({
		queryKey: ["documents", loanApplicationId],
		queryFn: () => getDocumentsForLoanApplication({ data: { loanApplicationId } }),
		enabled: !!loanApplicationId,
	});
};

