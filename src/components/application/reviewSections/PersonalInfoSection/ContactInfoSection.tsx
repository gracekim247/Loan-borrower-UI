import {
	Grid,
	Group,
	InputBase,
	NumberInput,
	Radio,
	Stack,
	TextInput,
	Divider,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { IconCalendar, IconMail, IconPhone } from "@tabler/icons-react";
import { IMaskInput } from "react-imask";
import { z } from "zod";

const contactInfoSchema = z.object({
	homeAddress: z.string().min(1, "Home address is required"),
	yearsAtLocation: z.string().optional(),
	mailingAddress: z.string().min(1, "Mailing address is required"),
	priorAddress: z.string().optional(),
	primaryPhone: z.string().refine(
		(value) => value && value.replace(/[^\d]/g, "").length === 10,
		"Valid primary phone is required"
	),
	workPhone: z.string().optional(),
	otherPhone: z.string().optional(),
	email: z.string().email("Invalid email address"),
	ssn: z.string().refine(
		(value) => value && value.replace(/[^\d]/g, "").length === 9,
		"Valid SSN is required"
	),
	primaryIdMethod: z.enum(["us_dl", "passport", "alien_reg"], {
		required_error: "Primary ID method is required",
	}),
	primaryIdNumber: z.string().min(1, "Primary ID number is required"),
	primaryIdIssueDate: z.date({ required_error: "Primary ID issue date is required" }).nullable(),
	primaryIdExpDate: z.date({ required_error: "Primary ID expiration date is required" }).nullable(),
	primaryIdState: z.string().min(1, "Primary ID state/county is required"),
	secondaryIdMethod: z.enum(["us_dl", "passport", "alien_reg"]).optional(),
	secondaryIdNumber: z.string().optional(),
	secondaryIdIssueDate: z.date().nullable().optional(),
	secondaryIdExpDate: z.date().nullable().optional(),
	secondaryIdState: z.string().optional(),
	ownershipPct: z.number().min(0, "Ownership % must be at least 0").max(100, "Ownership % must be at most 100"),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

export default function ContactInfoSection() {
	const form = useForm<ContactInfoFormValues>({
		initialValues: {
			homeAddress: "",
			yearsAtLocation: "",
			mailingAddress: "",
			priorAddress: "",
			primaryPhone: "",
			workPhone: "",
			otherPhone: "",
			email: "",
			ssn: "",
			primaryIdMethod: "us_dl",
			primaryIdNumber: "",
			primaryIdIssueDate: null,
			primaryIdExpDate: null,
			primaryIdState: "",
			secondaryIdMethod: undefined,
			secondaryIdNumber: "",
			secondaryIdIssueDate: null,
			secondaryIdExpDate: null,
			secondaryIdState: "",
			ownershipPct: 0,
		},
		validate: zodResolver(contactInfoSchema),
	});

	return (
		<div style={{width: '100%'}}>
			<Stack gap="lg">
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 6 }}>
						<TextInput
							label="Home Address (No P.O. Box)"
							required
							{...form.getInputProps("homeAddress")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<TextInput
							label="Years at this Location"
							{...form.getInputProps("yearsAtLocation")}
						/>
					</Grid.Col>
				</Grid>
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 6 }}>
						<TextInput
							label="Mailing Address"
							required
							{...form.getInputProps("mailingAddress")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<TextInput
							label="Prior Address"
							{...form.getInputProps("priorAddress")}
						/>
					</Grid.Col>
				</Grid>
				<Divider/>
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 4 }}>
						<InputBase
							label="Primary Phone"
							placeholder="(555) 123-4567"
							leftSection={<IconPhone size={18} />}
							component={IMaskInput}
							mask="(000) 000-0000"
							{...form.getInputProps("primaryPhone")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<InputBase
							label="Work Phone"
							placeholder="(555) 123-4567"
							leftSection={<IconPhone size={18} />}
							component={IMaskInput}
							mask="(000) 000-0000"
							{...form.getInputProps("workPhone")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<InputBase
							label="Other Phone"
							placeholder="(555) 123-4567"
							leftSection={<IconPhone size={18} />}
							component={IMaskInput}
							mask="(000) 000-0000"
							{...form.getInputProps("otherPhone")}
						/>
					</Grid.Col>
				</Grid>
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 4 }}>
						<TextInput
							label="Email Address"
							placeholder=""
							leftSection={<IconMail size={18} />}
							{...form.getInputProps("email")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<InputBase
							label="SSN"
							placeholder="000-00-0000"
							required
							component={IMaskInput}
							mask="000-00-0000"
							{...form.getInputProps("ssn")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<InputBase
							label="Tax ID"
							placeholder="00-0000000"
							component={IMaskInput}
							mask="00-0000000"
							{...form.getInputProps("taxId")}
						/>
					</Grid.Col>
				</Grid>
				{/* Primary Identification Method */}
				<Radio.Group
					label="Primary Identification Method"
					required
					{...form.getInputProps("primaryIdMethod")}
				>
					<Group gap="llg">
						<Radio value="us_dl" label="US Driver's License" />
						<Radio value="passport" label="Passport" />
						<Radio value="alien_reg" label="US Alien Registration" />
					</Group>
				</Radio.Group>
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 3 }}>
						<TextInput
							label="ID/Number"
							required
							{...form.getInputProps("primaryIdNumber")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<DateInput
							label="Issue Date"
							required
							leftSection={<IconCalendar size={18} />}
							{...form.getInputProps("primaryIdIssueDate")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<DateInput
							label="Expiration Date"
							required
							leftSection={<IconCalendar size={18} />}
							{...form.getInputProps("primaryIdExpDate")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<TextInput
							label="State/County Issued"
							required
							{...form.getInputProps("primaryIdState")}
						/>
					</Grid.Col>
				</Grid>
				{/* Secondary Identification Method */}
				<Radio.Group
					label="Secondary Identification Method"
					required
					{...form.getInputProps("secondaryIdMethod")}
				>
					<Group gap="lg">
						<Radio value="us_dl" label="US Driver's License" />
						<Radio value="passport" label="Passport" />
						<Radio value="alien_reg" label="US Alien Registration" />
					</Group>
				</Radio.Group>
				<Grid gutter="xl">
					<Grid.Col span={{ base: 12, md: 3 }}>
						<TextInput
							label="ID/Number"
							required
							{...form.getInputProps("secondaryIdNumber")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<DateInput
							label="Issue Date"
							required
							leftSection={<IconCalendar size={18} />}
							{...form.getInputProps("secondaryIdIssueDate")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<DateInput
							label="Expiration Date"
							required
							leftSection={<IconCalendar size={18} />}
							{...form.getInputProps("secondaryIdExpDate")}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 3 }}>
						<TextInput
							label="State/County Issued"
							required
							{...form.getInputProps("secondaryIdState")}
						/>
					</Grid.Col>
				</Grid>
				{/* Ownership % in Company */}
				<NumberInput
					label="Ownership % in Company"
					required
					min={0}
					max={100}
					decimalScale={2}
					suffix="%"
					{...form.getInputProps("ownershipPct")}
				/>
			</Stack>
		</div>
	);
}
