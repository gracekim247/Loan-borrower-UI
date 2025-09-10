import { gangaServiceClient } from "@krida/proto-client/clients";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { userAuthOrganizationMiddleware } from "~/middleware/auth-middleware";

const getLoanApplicationSchema = z.object({
	applicationId: z.string(),
});

export const getLoanApplication = createServerFn({
	method: "GET",
})
	.middleware([userAuthOrganizationMiddleware])
	.validator(getLoanApplicationSchema)
	.handler(async ({ data }) => {
		const response = await gangaServiceClient.getLoanApplication({
			loanApplicationId: data.applicationId,
		});
		return response.loanApplication;
	});

export const useGetLoanApplication = (applicationId: string) =>
	useQuery({
		queryKey: ["loanApplication", applicationId],
		queryFn: () => getLoanApplication({ data: { applicationId } }),
		enabled: !!applicationId,
	});
