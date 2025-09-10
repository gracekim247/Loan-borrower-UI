import { Grid, Group, Radio, Stack, Text, TextInput, Divider } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import type React from "react";
import { z } from "zod";
import styles from "./PersonalInfoSection.module.css";

const personalInfoSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	middleName: z.string().optional(),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.date({ required_error: "Date of birth is required" }).nullable(),
	placeOfBirth: z.string().min(1, "Place of birth is required"),
	citizenship: z.enum(["us_citizen", "resident_alien", "non_resident_alien"], {
		required_error: "Citizenship is required",
	}),
	occupation: z.string().min(1, "Occupation is required"),
	title: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export const PersonalInfoSection: React.FC = () => {
	const form = useForm<PersonalInfoFormValues>({
		initialValues: {
			firstName: "",
			middleName: "",
			lastName: "",
			dateOfBirth: null,
			placeOfBirth: "",
			citizenship: "us_citizen",
			occupation: "",
			title: "",
		},
		validate: zodResolver(personalInfoSchema),
	});

	const handleSubmit = (values: PersonalInfoFormValues) => {
		console.log("Form submitted:", values);
		// TODO: Handle form submission
	};

	return (
		<div className={styles.container}>
			<form onSubmit={form.onSubmit(handleSubmit)} autoComplete="off">
				<Stack gap="sm">
					<Grid gutter="xl">
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										First Name
									</span>
								}
								placeholder=""
								required
								{...form.getInputProps("firstName")}
							/>
							<Text fz='xs' mt={0} c='#7048e8'>
								Automatically imported from Driver's License
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										Middle Name
									</span>
								}
								placeholder=""
								required
								{...form.getInputProps("middleName")}
							/>
							<Text fz='xs' mt={0} c='#7048e8'>
								Automatically imported from Driver's License
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										Last Name
									</span>
								}
								placeholder=""
								required
								{...form.getInputProps("lastName")}
							/>
							<Text fz='xs' mt={0} c='#7048e8'>
								Automatically imported from Driver's License
							</Text>
						</Grid.Col>
					</Grid>
					<Grid gutter="xl" mt={0}>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<DateInput
								label={
									<span className={styles.importedLabel}>
										Date of birth
									</span>
								}
								placeholder="MM/DD/YYYY"
								required
								maxDate={new Date()}
								leftSection={<IconCalendar size={18} />}
								{...form.getInputProps("dateOfBirth")}
							/>
							<Text fz='xs' mt={0} c='#7048e8'>
								Automatically imported from Driver's License
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 8 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										Place of birth
									</span>
								}
								placeholder=""
								required
								{...form.getInputProps("placeOfBirth")}
							/>
							<Text fz='xs' mt={0} c='#7048e8'>
								Automatically imported from Passport
							</Text>
						</Grid.Col>
					</Grid>
					<Divider/>
					{/* Citizenship */}
					<Radio.Group
						label={
							<span className={styles.importedLabel}>
								Citizenship
							</span>
						}
						required
						{...form.getInputProps("citizenship")}
					>
						<Group gap="lg">
							<Radio value="us_citizen" label="US Citizen" />
							<Radio value="resident_alien" label="Resident Alien" />
							<Radio value="non_resident_alien" label="Non-Resident Alien" />
						</Group>
					</Radio.Group>

					<Grid gutter="xl">
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										Occupation
									</span>
								}
								required
								{...form.getInputProps("occupation")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label={
									<span className={styles.importedLabel}>
										Title
									</span>
								}
								{...form.getInputProps("title")}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</form>
		</div>
	);
};
