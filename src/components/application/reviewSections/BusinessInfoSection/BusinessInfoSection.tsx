import {
	Box,
	Group,
	Radio,
	Select,
	Stack,
	Table,
	Text,
	TextInput,
	Divider
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { IconCalendar, IconId, IconMail, IconPhone, IconBuilding } from "@tabler/icons-react";
import type React from "react";
import { z } from "zod";
import styles from "./BusinessInfoSection.module.css";

// Zod schema for business information validation
const businessInfoSchema = z.object({
	legalName: z.string().min(1, "Legal business name is required"),
	fictitiousName: z.string().min(1, "Fictitious business name is required"),
	businessAddress: z.string().min(1, "Business address is required"),
	yearsAtLocation: z.string().optional(),
	mailingAddress: z.string().optional(),
	businessPhone: z.string().min(1, "Business phone is required").refine(
		(value) => value && value.replace(/[^\d]/g, "").length === 10,
		"Valid business phone is required"
	),
	faxPhone: z.string().optional(),
	email: z.string().email("Invalid email address").min(1, "Email is required"),
	entityType: z.string().min(1, "Entity type is required"),
	naicsCode: z.string().min(1, "NAICS code is required"),
	dateEstablished: z.date({ required_error: "Date established is required" }).nullable(),
	natureOfBusiness: z.string().min(1, "Nature of business is required"),
	idType: z.enum(["fed", "ssn"], { required_error: "ID type is required" }),
	taxIdNumber: z.string().min(1, "Tax ID number is required").refine(
		(value) => value && value.replace(/[^\d]/g, "").length === 9,
		"Valid tax ID is required"
	),
	secondaryIdType: z.enum(["drivers_license", "passport", "alien_registration"], {
		required_error: "Secondary ID type is required",
	}),
	secondaryIdNumber: z.string().min(1, "Secondary ID number is required"),
	secondaryIdIssueDate: z.date({ required_error: "Secondary ID issue date is required" }).nullable(),
	secondaryIdExpiration: z.date({ required_error: "Secondary ID expiration date is required" }).nullable(),
	secondaryIdState: z.string().min(1, "Secondary ID state is required"),
	annualRevenue: z.string().min(1, "Annual revenue is required"),
	periodReported: z.string().min(1, "Period reported is required"),
	numberOfEmployees: z.string().min(1, "Number of employees is required"),
	salesMarketTerritory: z.enum(["national", "international", "regional", "local"], {
		required_error: "Sales market territory is required",
	}),
	foreignWire: z.enum(["yes", "no"], { required_error: "Foreign wire activity is required" }),
	foreignWireAmount: z.string().optional(),
	domesticWire: z.enum(["yes", "no"], { required_error: "Domestic wire activity is required" }),
	domesticWireAmount: z.string().optional(),
	cashActivity: z.string().optional(),
	achActivity: z.string().optional(),
	cashCheck: z.enum(["yes", "no"], { required_error: "Cash check services is required" }),
	moreThanThousand: z.enum(["yes", "no"], { required_error: "Amount over $1000 is required" }),
	moneyAchActivity: z.string().min(1, "ACH activity is required"),
	sellsMoneyOrders: z.enum(["yes", "no"], { required_error: "Money orders question is required" }),
	internetGambling: z.enum(["yes", "no"], { required_error: "Internet gambling question is required" }),
	debtSchedule: z.array(z.object({
		creditor: z.string(),
		originalAmount: z.string(),
		originalDate: z.string(),
		currentBalance: z.string(),
		interestRate: z.string(),
		maturityDate: z.string(),
		collateral: z.string(),
		status: z.string(),
	})).optional(),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

interface DebtScheduleRow {
	creditor: string;
	originalAmount: string;
	originalDate: string;
	currentBalance: string;
	interestRate: string;
	maturityDate: string;
	collateral: string;
	status: string;
}

const ENTITY_TYPES = [
	"C Corporation",
	"S Corporation",
	"LLC",
	"Partnership",
	"Sole Proprietorship",
	"Nonprofit",
	"Other",
];

const SECONDARY_ID_TYPES = [
	{ value: "drivers_license", label: "US Driver's License" },
	{ value: "passport", label: "Passport" },
	{ value: "alien_registration", label: "US Alien Registration" },
];

const SALES_MARKET_TERRITORY_OPTIONS = [
	{ value: "national", label: "National" },
	{ value: "international", label: "International" },
	{ value: "regional", label: "Regional" },
	{ value: "local", label: "Local" },
];

const YES_NO_OPTIONS = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
];

const MONEY_SERVICES_QUESTIONS = [
	{
		key: "cashCheck",
		question: "Does your business profile cash check services?",
		subtext: "(except your employee's payroll checks):",
		required: true,
	},
	{
		key: "moreThanThousand",
		question: "If yes, is this amount more than $1000 per day?",
		required: true,
	},
	{
		key: "moneyAchActivity",
		question: "Anticipated ACH activity per month:",
		required: true,
	},
	{
		key: "sellsMoneyOrders",
		question: "Does your business sell money orders, / traveler's checks or gift cards that can be exchanged for cash or exchange currency?",
		required: true,
	},
	{
		key: "internetGambling",
		question: "Does your business engage in or facilitate payments relating to Internet gambling?",
		required: true,
	},
];

const DEBT_SCHEDULE_DATA = [
	{
		creditor: "SBA",
		originalAmount: "$150,000",
		originalDate: "2022",
		currentBalance: "$131,614",
		interestRate: "3.75%",
		maturityDate: "05/19/2050",
		collateral: "",
		status: "Current",
	},
	{
		creditor: "Ron Whiting",
		originalAmount: "$500,000",
		originalDate: "2019",
		currentBalance: "$182,000",
		interestRate: "",
		maturityDate: "2027",
		collateral: "",
		status: "Current",
	},
];

const TABLE_HEADERS = [
	"Name of Creditor",
	"Original Amount",
	"Original Date",
	"Current Balance",
	"Interest Rate",
	"Maturity Date",
	"Collateral",
	"Current or Delinquent",
];

export const BusinessInfoSection: React.FC = () => {
	const form = useForm<BusinessInfoFormValues>({
		initialValues: {
			legalName: "",
			fictitiousName: "",
			businessAddress: "",
			yearsAtLocation: "",
			mailingAddress: "",
			businessPhone: "",
			faxPhone: "",
			email: "",
			entityType: "",
			naicsCode: "",
			dateEstablished: null,
			natureOfBusiness: "",
			idType: "fed" as const,
			taxIdNumber: "",
			secondaryIdType: "drivers_license" as const,
			secondaryIdNumber: "",
			secondaryIdIssueDate: null,
			secondaryIdExpiration: null,
			secondaryIdState: "",
			annualRevenue: "",
			periodReported: "",
			numberOfEmployees: "",
			salesMarketTerritory: "national" as const,
			foreignWire: "no" as const,
			foreignWireAmount: "",
			domesticWire: "no" as const,
			domesticWireAmount: "",
			cashActivity: "",
			achActivity: "",
			cashCheck: "no" as const,
			moreThanThousand: "no" as const,
			moneyAchActivity: "",
			sellsMoneyOrders: "no" as const,
			internetGambling: "no" as const,
			debtSchedule: [
				{
					creditor: "",
					originalAmount: "",
					originalDate: "",
					currentBalance: "",
					interestRate: "",
					maturityDate: "",
					collateral: "",
					status: "",
				},
			],
		},
		validate: zodResolver(businessInfoSchema),
	});

	const renderRadioGroup = (
		label: string,
		value: string,
		onChange: (value: string) => void,
		options: { value: string; label: string }[],
		required: boolean = false,
		className?: string
	) => (
		<Radio.Group
			label={label}
			value={value}
			onChange={onChange}
			required={required}
			className={className}
		>
			<Group gap="md">
				{options.map((option) => (
					<Radio key={option.value} value={option.value} label={option.label} />
				))}
			</Group>
		</Radio.Group>
	);

	const renderMoneyServiceQuestion = (questionData: typeof MONEY_SERVICES_QUESTIONS[0]) => (
		<Box key={questionData.key}>
			<Text fz='sm' mb='xs'>
				{questionData.question}
				{questionData.subtext && (
					<Text span className={styles.subtext} fz='xs'>
						{" "}{questionData.subtext}
					</Text>
				)}
			</Text>
			{renderRadioGroup(
				"",
				form.values[questionData.key as keyof BusinessInfoFormValues] as string,
				(value) => form.setFieldValue(questionData.key as keyof BusinessInfoFormValues, value),
				YES_NO_OPTIONS,
				questionData.required,
				styles.radioGroup
			)}
		</Box>
	);

	return (
		<Box>
			<Group
				justify="space-between"
				mb={2}
				tabIndex={0}
				aria-label="Company Information section header"
                pb='md'
                pl={0}
			>
				<Group gap={8}>
					<IconBuilding
						size={35}
						className={styles.businessIcon}
					/>
					<Stack gap={2}>
						<Text fw={600} fs='md'>Company Information</Text>
					</Stack>
				</Group>
			</Group>
			<Stack gap="lg">
				<Group grow>
					<TextInput
						label="Legal Business Name"
						required
						{...form.getInputProps("legalName")}
					/>
					<TextInput
						label="Fictitious Business Name"
						required
						{...form.getInputProps("fictitiousName")}
					/>
				</Group>
				<Divider/>
				<Group grow>
					<TextInput
						label="Business Address"
						required
						{...form.getInputProps("businessAddress")}
					/>
					<TextInput
						label="Years at this Location"
						{...form.getInputProps("yearsAtLocation")}
					/>
				</Group>
				<TextInput
					label="Mailing Address"
					{...form.getInputProps("mailingAddress")}
				/>
				<Divider/>
				<Group grow>
					<TextInput
						label="Business Phone"
						required
						leftSection={<IconPhone size={16} />}
						{...form.getInputProps("businessPhone")}
					/>
					<TextInput
						label="Fax Phone"
						leftSection={<IconPhone size={16} />}
						{...form.getInputProps("faxPhone")}
					/>
					<TextInput
						label="Email Address"
						required
						leftSection={<IconMail size={16} />}
						{...form.getInputProps("email")}
					/>
				</Group>
				<Divider/>
				<Group grow>
					<Select
						label="Entity Type"
						required
						data={ENTITY_TYPES}
						placeholder="Select entity type"
						{...form.getInputProps("entityType")}
					/>
					<TextInput
						label="NAICS Code"
						required
						{...form.getInputProps("naicsCode")}
					/>
					<DateInput
						label="Date Business Established"
						required
						value={form.values.dateEstablished}
						onChange={(value) => form.setFieldValue("dateEstablished", value as Date | null)}
						leftSection={<IconCalendar size={16} />}
						placeholder="MM/DD/YYYY"
					/>
				</Group>
				<TextInput
					label="Nature of Business"
					required
					{...form.getInputProps("natureOfBusiness")}
				/>
				<Divider/>
				{renderRadioGroup(
					"ID Type",
					form.values.idType,
					(value) => form.setFieldValue("idType", value as "fed" | "ssn"),
					[
						{ value: "fed", label: "FED" },
						{ value: "ssn", label: "SSN" },
					],
					true
				)}
				<TextInput
					label="Tax ID Number"
					required
					leftSection={<IconId size={16} />}
					{...form.getInputProps("taxIdNumber")}
				/>
				{renderRadioGroup(
						"Secondary Identification Method",
						form.values.secondaryIdType,
						(value) => form.setFieldValue("secondaryIdType", value as "drivers_license" | "passport" | "alien_registration"),
						SECONDARY_ID_TYPES,
						true
				)}
				<Group grow>
					<TextInput
						label="ID/Number"
						required
						{...form.getInputProps("secondaryIdNumber")}
					/>
					<DateInput
						label="Issue Date"
						required
						value={form.values.secondaryIdIssueDate}
						onChange={(value) =>
							form.setFieldValue("secondaryIdIssueDate", value as Date | null)
						}
						leftSection={<IconCalendar size={16} />}
						placeholder="MM/DD/YYYY"
					/>
					<DateInput
						label="Expiration Date"
						required
						value={form.values.secondaryIdExpiration}
						onChange={(value) =>
							form.setFieldValue("secondaryIdExpiration", value as Date | null)
						}
						leftSection={<IconCalendar size={16} />}
						placeholder="MM/DD/YYYY"
					/>
					<TextInput
						label="State/ County Issued"
						required
						{...form.getInputProps("secondaryIdState")}
					/>
				</Group>
				<Group grow>
					<TextInput
						label="Annual Revenue"
						required
						{...form.getInputProps("annualRevenue")}
					/>
					<TextInput
						label="Period Reported"
						required
						{...form.getInputProps("periodReported")}
					/>
					<TextInput
						label="Number of Employees"
						required
						{...form.getInputProps("numberOfEmployees")}
					/>
				</Group>

				{renderRadioGroup(
					"Business Sales Market Territory",
					form.values.salesMarketTerritory,
					(value) => form.setFieldValue("salesMarketTerritory", value as "national" | "international" | "regional" | "local"),
					SALES_MARKET_TERRITORY_OPTIONS,
					true
				)}

				{/* Wire Activity */}
				<Group align="flex-end" grow>
					<Box className={styles.flexBox}>
						<Text fw={500} fz='sm'>
							Will there be foreign wire activity?
						</Text>
						{renderRadioGroup(
							"",
							form.values.foreignWire,
							(value) => form.setFieldValue("foreignWire", value as "yes" | "no"),
							YES_NO_OPTIONS,
							true
						)}
					</Box>
					<TextInput
						label="Anticipated dollar amount per month:"
						value={form.values.foreignWireAmount}
						onChange={(event) =>
							form.setFieldValue("foreignWireAmount", event.currentTarget.value)
						}
					/>
				</Group>
				<Group align="flex-end" grow>
					<Box className={styles.flexBox}>
						<Text fw={500} fz='sm'>
							Will there be domestic wire activity?
						</Text>
						{renderRadioGroup(
							"",
							form.values.domesticWire,
							(value) => form.setFieldValue("domesticWire", value as "yes" | "no"),
							YES_NO_OPTIONS,
							true
						)}
					</Box>
					<TextInput
						label="Anticipated dollar amount per month:"
						value={form.values.domesticWireAmount}
						onChange={(event) =>
							form.setFieldValue("domesticWireAmount", event.currentTarget.value)
						}
					/>
				</Group>
				{/* Cash/ACH Activity */}
				<Group grow>
					<Box className={styles.flexBox}>
						<TextInput
							label="Cash (Currency) Activity"
							value={form.values.cashActivity}
							onChange={(event) =>
								form.setFieldValue("cashActivity", event.currentTarget.value)
							}
						/>
						<Text className={styles.subtext} fz='xs'>
							Anticipated cash (currency) withdrawal and/or deposit per month:
						</Text>
					</Box>
					<Box className={styles.flexBox}>
						<TextInput
							label="ACH"
							value={form.values.achActivity}
							onChange={(event) =>
								form.setFieldValue("achActivity", event.currentTarget.value)
							}
						/>
						<Text className={styles.subtext} fz='xs'>
							Anticipated ACH activity per month:
						</Text>
					</Box>
				</Group>

                <Divider/>
				{/* Money Services Rendered */}
				<Box>
					<Text fw={600} fz='sm' mb='sm'>
						Money Services Rendered:
					</Text>
					<Stack gap="xs">
						{MONEY_SERVICES_QUESTIONS.map(renderMoneyServiceQuestion)}
					</Stack>
				</Box>

                <Divider /> 
                {/* Debt Schedule Table */}
				<Box>
					<Text fw={600} fz='sm' mb='sm'>
						Debt Schedule:
					</Text>
					<Text className={styles.descriptionText} fz='xs' mb='sm'>
						Include the following information on all installments, debts, notes,
						contracts and mortgages:
					</Text>
					<Table className={styles.table} withTableBorder withColumnBorders>
						<Table.Thead>
							<Table.Tr>
								{TABLE_HEADERS.map((header) => (
									<Table.Th key={header} className={styles.th} fw={600} fz='sm'>
										{header}
									</Table.Th>
								))}
							</Table.Tr>
						</Table.Thead>

						<Table.Tbody>
							{DEBT_SCHEDULE_DATA.map((row, index) => (
								<Table.Tr key={index}>
									<Table.Td className={styles.td} fz='sm'>{row.creditor}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.originalAmount}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.originalDate}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.currentBalance}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.interestRate}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.maturityDate}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.collateral}</Table.Td>
									<Table.Td className={styles.td} fz='sm'>{row.status}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
			</Stack>
		</Box> 
	);
};

export default BusinessInfoSection;
