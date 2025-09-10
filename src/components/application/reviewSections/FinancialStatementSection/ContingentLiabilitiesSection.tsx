import { Box, Group, Radio, Stack, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import type React from "react";
import { z } from "zod";

const contingentLiabilityQuestions: { key: string; label: string }[] = [
	{
		key: "guarantor",
		label:
			"Are you a guarantor, co-maker or endorser for any debt of any person or entity?",
	},
	{
		key: "lettersOfCredit",
		label: "Do you have any outstanding letters of credit or surety bonds?",
	},
	{
		key: "legalActions",
		label: "Are there any suits or legal actions pending against you?",
	},
	{
		key: "leaseOrContract",
		label: "Are you contingently liable on any lease or contract?",
	},
	{
		key: "taxObligationsPastDue",
		label: "Are any of your tax obligations past due?",
	},
	{
		key: "generalPartner",
		label: "Are you contingently liable as general partner for the debts of any partnership?",
	},
	{
		key: "otherContingent",
		label: "Do you have any other contingent liabilities?",
	},
	{
		key: "bankruptcy",
		label: "Have you (or your spouse or any firm in which you are a major owner or guarantor) ever declared bankruptcy?",
	},
	{
		key: "repossession",
		label: "Have you or your spouse ever voluntarily surrendered or had a vehicle, appliance or any other item repossessed?",
	},
	{
		key: "taxReturnsAudited",
		label: "Are any of your or your spouse's tax returns currently being audited or contested?",
	},
	{
		key: "otherNameCredit",
		label: "Have you or your spouse applied for or obtained credit under another name within the last 10 years?",
	},
	{
		key: "unusedCreditFacility",
		label: "Do you or your spouse have any unused credit facility with any other institution(s)? (credit cards)",
	},
	{
		key: "pastBankingRelationship",
		label: "Have you or your spouse ever had a past banking relationship with Santa Cruz County Bank?",
	},
	{
		key: "encumberedAssets",
		label: "Are any assets encumbered or debts secured except as indicated?",
	},
	{ 
        key: "usCitizens", 
        label: "Are you and your spouse U.S. citizens?" 
    },
];

// Create a schema object with all the contingent liability questions
const contingentLiabilitiesSchemaObject = contingentLiabilityQuestions.reduce((acc, question) => {
	acc[question.key] = "" as any;
	return acc;
}, {} as Record<string, z.ZodEnum<["yes", "no"]>>);

// Zod schema for contingent liabilities validation
const contingentLiabilitiesSchema = z.object(contingentLiabilitiesSchemaObject);

type ContingentLiabilitiesFormValues = z.infer<typeof contingentLiabilitiesSchema>;

export const ContingentLiabilitiesSection: React.FC = () => {
	// Create initial values object using the question keys
	const initialValues = contingentLiabilityQuestions.reduce((acc, question) => {
		acc[question.key] = "" as any; // Empty string for no default selection
		return acc;
	}, {} as ContingentLiabilitiesFormValues);

	const form = useForm<ContingentLiabilitiesFormValues>({
		initialValues,
		validate: zodResolver(contingentLiabilitiesSchema),
	});

	return (
		<Box style={{width: '100%'}}>
			<Stack gap="xs">
				{contingentLiabilityQuestions.map(
					(q: { key: string; label: string }) => (
						<Radio.Group
							key={q.key}
							name={q.key}
							label={
								<Text fz='sm' c='black'>
									{q.label}
								</Text>
							}
							value={form.values[q.key as keyof ContingentLiabilitiesFormValues] as string || ""}
							onChange={(value) =>
								form.setFieldValue(q.key as keyof ContingentLiabilitiesFormValues, value as "yes" | "no")
							}
							withAsterisk={false}
							mb='xs'
						>
							<Group gap="xl">
								<Radio value="yes" label="Yes" />
								<Radio value="no" label="No" />
							</Group>
						</Radio.Group>
					),
				)}
			</Stack>
		</Box>
	);
}; 
