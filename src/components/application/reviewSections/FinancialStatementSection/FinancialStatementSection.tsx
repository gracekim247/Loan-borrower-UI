import {
	Box,
	Group,
	Radio,
	Stack,
	Table,
	Text,
	TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCornerDownRight } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useState } from "react";
import styles from "./FinancialStatementSection.module.css";

const INCOME_ROWS = [
	"Borrower Salary",
	"Spouse Salary", 
	"Interest and Dividend Income",
	"Business Income",
	"Capital Gains",
	"Net Rental Income",
	"Partnerships, S Corp, LLC & LLP Distributions",
	"Other Income (list)",
];

const EXPENSE_ROWS = [
	"Payments on Real Estate Loans",
	"Real Estate Property Taxes",
	"Rental Payment",
	"Other Installment Payments",
	"Income Taxes",
	"Insurance",
	"Partnerships, S Corp, LLC & LLP Contributions",
	"Educational Expense",
	"Other Expense (list)",
];

interface FormValues {
	income: string[];
	expense: string[];
	assets: string[];
	liabilities: string[];
	statementType: string;
	asOfDate: Date | null;
	trustIRA: string;
}

const ASSET_ROWS = [
	"Cash / Checking Accounts",
	"Cash / Money Market / CDs",
	"Readily Marketable Stocks & Bonds (A)",
	"Non-Readily Marketable Stocks & Bonds (B)",
	"Accounts & Notes Receivable (C)",
	"Real Estate (D)",
	"Net Cash Surrender Value of Life Insurance (E)",
	"Partnership, S Corp, LLC & LLP Interest (F)",
	"Vested Retirement Balance",
	"Personal Property and Other Assets (list)",
	"Various Autos",
];

const LIABILITY_ROWS = [
	"Notes Payable to Banks",
	"Margin Accounts Payable",
	"Notes Payable to Others (G)",
	"Accounts Payable",
	"Real Estate Debt",
	"Taxes Payable (current year)",
	"Taxes Payable (previous year)",
	"Educational Expense",
	"Other Expense (list)",
	"Other Liabilities (list)",
	"Living expenses",
	"Net Worth",
	"Living expenses (total)",
];

export const FinancialStatementSection: React.FC = () => {
	const form = useForm<FormValues>({
		initialValues: {
			income: Array(INCOME_ROWS.length).fill(""),
			expense: Array(EXPENSE_ROWS.length).fill(""),
			assets: Array(ASSET_ROWS.length).fill(""),
			liabilities: Array(LIABILITY_ROWS.length).fill(""),
			statementType: "joint",
			asOfDate: null,
			trustIRA: "",
		},
	});

	// State for calculated totals
	const [totalAssets, setTotalAssets] = useState(0);
	const [totalLiabilities, setTotalLiabilities] = useState(0);
	const [netWorth, setNetWorth] = useState(0);
	const [totalIncome, setTotalIncome] = useState(0);
	const [totalExpense, setTotalExpense] = useState(0);

	// Helper to parse currency inputs
	const parseAmount = (val: string) =>
		parseFloat(val.replace(/[^\d.]/g, "")) || 0;

	// Watch form fields and update totals when they change
	useEffect(() => {
		const assets = form.values.assets;
		const liabilities = form.values.liabilities;
		const income = form.values.income;
		const expense = form.values.expense;

		// Calculate totals
		const newTotalAssets = assets.reduce(
			(sum: number, val: string) => sum + parseAmount(val),
			0,
		);
		const newTotalLiabilities = liabilities.reduce(
			(sum: number, val: string, i: number) => (i !== 11 && i !== 12 ? sum + parseAmount(val) : sum),
			0,
		); // Exclude Net Worth and last Living expenses row
		const newNetWorth = newTotalAssets - newTotalLiabilities;

		// Update state
		setTotalAssets(newTotalAssets);
		setTotalLiabilities(newTotalLiabilities);
		setNetWorth(newNetWorth);

		// Set Net Worth cell in liabilities array automatically
		const formattedNetWorth = newNetWorth.toLocaleString("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		});

		if (liabilities[11] !== formattedNetWorth) {
			form.setFieldValue("liabilities.11", formattedNetWorth);
		}

		// Calculate income and expense totals
		const newTotalIncome = income.reduce(
			(sum: number, val: string) => sum + parseAmount(val),
			0,
		);
		const newTotalExpense = expense.reduce(
			(sum: number, val: string) => sum + parseAmount(val),
			0,
		);

		setTotalIncome(newTotalIncome);
		setTotalExpense(newTotalExpense);
	}, [form.values.assets, form.values.liabilities, form.values.income, form.values.expense]);

	return (
		<Stack gap="lg" className={styles.container}>
			<Table tabularNums className={styles.table} withTableBorder withColumnBorders >
				<Table.Thead className={styles.thead}>
					<Table.Tr>
						<Table.Th className={styles.th} fz='sm' fw={600}>Annual Cash Income</Table.Th>
						<Table.Th className={styles.thAmount} fw={600}>Amount</Table.Th>
						<Table.Th className={styles.th} fz='sm' fw={600}>Annual Cash Expenditures</Table.Th>
						<Table.Th className={styles.thAmount} fw={600}>Amount</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{Array.from({
						length: Math.max(INCOME_ROWS.length, EXPENSE_ROWS.length),
					}).map((_, i) => (
						<Table.Tr
							key={`income-expense-${i}-${INCOME_ROWS[i] || ""}-${EXPENSE_ROWS[i] || ""}`}
						>
							<Table.Td className={styles.labelCell} fz='sm' fw={400}>
								{INCOME_ROWS[i] || ""}
							</Table.Td>
							<Table.Td className={styles.inputCell} fz='sm' fw={400} p={0}>
								{INCOME_ROWS[i] && (
									<TextInput
										value={form.values.income[i]}
										onChange={(e) =>
											form.setFieldValue(`income.${i}`, e.currentTarget.value)
										}
										placeholder="$0"
										size="sm"
										classNames={{ input: styles.input }}
                                        fz='sm'
									/>
								)}
							</Table.Td>
							<Table.Td className={styles.labelCell} fz='sm' fw={400}>
								{EXPENSE_ROWS[i] || ""}
							</Table.Td>
							<Table.Td className={styles.inputCell} fz='sm' fw={400} p={0}>
								{EXPENSE_ROWS[i] && (
									<TextInput
										value={form.values.expense[i]}
										onChange={(e) =>
											form.setFieldValue(`expense.${i}`, e.currentTarget.value)
										}
										placeholder="$0"
										size="sm"
										classNames={{ input: styles.input }}
									/>
								)}
							</Table.Td>
						</Table.Tr>
					))}
					<Table.Tr className={styles.totalsRow} fw={600}>
						<Table.Td className={styles.labelCell} fz='sm' fw={600}>
							Total Annual Cash Income
						</Table.Td>
						<Table.Td className={styles.totalCell} fw={600}>
							{totalIncome.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
								maximumFractionDigits: 0,
							})}
						</Table.Td>
						<Table.Td className={styles.labelCell} fz='sm' fw={600}>
							Total Annual Cash Expenditures
						</Table.Td>
						<Table.Td className={styles.totalCell} fw={600}>
							{totalExpense.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
								maximumFractionDigits: 0,
							})}
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>

			<Radio.Group
				label={
					<Text fz='sm' fw={400} mb='xs' mt='xs' >
						This is a statement of
					</Text>
				}
				value={form.values.statementType}
				onChange={(value) => form.setFieldValue("statementType", value)}
			>
				<Group gap="xl">
					<Radio value="individual" label="My individual financial condition" />
					<Radio value="joint" label="Our joint financial condition" />
					<Radio value="trust" label="Trust financial condition only" />
				</Group>
			</Radio.Group>
			<Group align="flex-end" gap={8}>
				<Box className={styles.iconBox}>
					<IconCornerDownRight />
				</Box>
				<DateInput
					label={
						<Text className={styles.dateLabel} mb='xs' fz='sm'>
							as of
						</Text>
					}
					placeholder="MM/DD/YYYY"
					value={form.values.asOfDate}
					onChange={(value) =>
						form.setFieldValue("asOfDate", value as Date | null)
					}
					maw={180}
					mb={0}
					classNames={{input: styles.dateInput}}
                    fz='sm'
				/>
			</Group>

			<Table tabularNums className={styles.table} mt="xl" withTableBorder withColumnBorders>
				<Table.Thead className={styles.thead}>
					<Table.Tr>
						<Table.Th className={styles.th} fz='sm' fw={600}>Assets</Table.Th>
						<Table.Th className={styles.thAmount} fw={600}>Amount</Table.Th>
						<Table.Th className={styles.th} fz='sm' fw={600}>Liabilities and net worth</Table.Th>
						<Table.Th className={styles.thAmount} fw={600}>Amount</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{Array.from({
						length: Math.max(ASSET_ROWS.length, LIABILITY_ROWS.length),
					}).map((_, i) => (
						<Table.Tr
							key={`asset-liability-${i}-${ASSET_ROWS[i] || ""}-${LIABILITY_ROWS[i] || ""}`}
						>
							{/* Asset side */}
							<Table.Td className={styles.labelCell} fz='sm' fw={400}>
								{ASSET_ROWS[i] || ""}
							</Table.Td>
							<Table.Td className={styles.inputCell} fz='sm' fw={400} p={0}>
								{ASSET_ROWS[i] ? (
									<TextInput
										value={form.values.assets[i]}
										onChange={(e) =>
											form.setFieldValue(`assets.${i}`, e.currentTarget.value)
										}
										placeholder="$0"
										size="sm"
										classNames={{ input: styles.input }}
									/>
								) : null}
							</Table.Td>

							{/* Liability side */}
							<Table.Td
								className={`${styles.labelCell} fz='sm' fw={400} ${LIABILITY_ROWS[i] === "Net Worth" ? styles.netWorthLabel : ""}`}
							>
								{LIABILITY_ROWS[i] || ""}
							</Table.Td>
							<Table.Td className={styles.inputCell} fz='sm' fw={400} p={0}>
								{LIABILITY_ROWS[i] === "Net Worth" ? (
									<Text className={`${styles.netWorthValue} ${netWorth < 0 ? styles.negativeValue : ""}`}>
										{netWorth.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
											maximumFractionDigits: 0,
										})}
									</Text>
								) : LIABILITY_ROWS[i] ? (
									<TextInput
										value={form.values.liabilities[i]}
										onChange={(e) =>
											form.setFieldValue(
												`liabilities.${i}`,
												e.currentTarget.value,
											)
										}
										placeholder="$0"
										size="sm"
										classNames={{ input: styles.input }}
									/>
								) : null}
							</Table.Td>
						</Table.Tr>
					))}
					{/* Summary row */}
					<Table.Tr className={styles.totalsRow} fw={600}>
						<Table.Td className={styles.labelCell} fw={600} fz='sm'>
							Total Assets
						</Table.Td>
						<Table.Td className={styles.totalCell} fw={600}>
							{totalAssets.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
								maximumFractionDigits: 0,
							})}
						</Table.Td>
						<Table.Td className={styles.labelCell} fw={600} fz='sm'>
							Total Liabilities and Net Worth
						</Table.Td>
						<Table.Td className={styles.totalCell} fw={600}>
							{(totalLiabilities + netWorth).toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
								maximumFractionDigits: 0,
							})}
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>

			{/* Trust/IRA/Retirement Radio */}
			<Radio.Group
				name="trustIRA"
				label={
					<Text className={styles.trustLabel} fz='sm'>
						Does this statement contain assets held in Trust, IRA, or other
						retirement accounts?
					</Text>
				}
				value={form.values.trustIRA}
				onChange={(value) => form.setFieldValue("trustIRA", value)}
				withAsterisk={false}
				mt='sm'
			>
				<Group gap="xl">
					<Radio value="yes" label="Yes" />
					<Radio value="no" label="No" />
				</Group>
			</Radio.Group>
		</Stack>
	);
};

export default FinancialStatementSection;
