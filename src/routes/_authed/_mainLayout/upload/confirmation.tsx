import { createFileRoute } from '@tanstack/react-router';
import { Stack, Text, Box, Paper, Group, Badge} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import styles from "./confirmation.module.css";

export const Route = createFileRoute('/_authed/_mainLayout/upload/confirmation')({
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const nextSteps = [
    {
      icon: <IconCheck size={20} color="white" style={{border: '1px solid #51cf66', borderRadius: '50%', backgroundColor:'#51cf66', padding:'2px'}} />,
      title: "Application Submitted",
    //   description: "07/16/2025"
    },
    {
      icon: <Badge size="md" circle color="black">2</Badge>,
      title: "Initial Review",
    },
    {
      icon: <Badge size="md" circle color="white" style={{color:"rgb(93, 93, 93)", border:"1px solid rgb(192, 192, 192)" }}>3</Badge>,
      title: "Loan Committee Decision",
    },
    {
      icon: <Badge size="md" circle color="white" style={{color:"rgb(93, 93, 93)", border:"1px solid rgb(192, 192, 192)"}}>4</Badge>,
      title: "Loan Approved",
    },
    {
      icon: <Badge size="md" circle color="white" style={{color:"rgb(93, 93, 93)", border:"1px solid rgb(192, 192, 192)"}}>5</Badge>,
      title: "Funds Distributed",
    }
  ];

  return (
    <>
        {/* Main Content */}
        <Box className={styles.mainContent}>
            <Stack gap="xs" align="center">
                
                {/* Success Message */}
                <Stack gap="xs" align="center" style={{ textAlign: 'center' }}>
                    <Box className={styles.successIcon}>
                        <IconCheck size={30} color="#51cf66" />
                    </Box>
                    <Text size="xl" fw={600}>
                        Your application has been submitted
                    </Text>
                    <Box>
                        <Text size="sm" c="dimmed" style={{ maxWidth: 550 }}>
                            A loan officer will review your submission and reach out to you shortly.
                        </Text>
                        <Text size="sm" c="dimmed" style={{ maxWidth: 550, }}>
                            Here's what happens next:
                        </Text>
                    </Box>
                </Stack>

                {/* What Happens Next Section */}
                <Paper p="lg" radius="md" className={styles.nextStepsPaper}>
                    <Stack gap="lg">
                        <Stack gap="md">
                            {nextSteps.map((step, index) => (
                                <Group key={index} align="flex-start" gap="md" >
                                    <Box className={styles.stepIcon}>
                                        {step.icon}
                                    </Box>
                                    <Stack gap="0" className={styles.stepContent}>
                                        <Text fw={400} size="sm" className={styles.stepTitle}>
                                            {step.title}
                                        </Text>
                                        {/* {step.description && (
                                            <Text size="xs" c="dimmed">
                                                {step.description}
                                            </Text>
                                        )} */}
                                    </Stack>
                                </Group>
                            ))}
                        </Stack> 
                    </Stack>
                </Paper>

            </Stack>
        </Box>
    </>
  );
} 
