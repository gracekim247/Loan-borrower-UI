import { createFileRoute, Link } from '@tanstack/react-router';
import { Box, Group, Stack, Text, Button, Divider, Flex, Paper, Textarea } from '@mantine/core';
import { useState } from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import styles from './submit.module.css';

// Document data from upload page
const ownerDocs = [
  { document: 'Tax Returns', subdocument: 'Most Recent Year', file: 'returns.pdf', status: 'Blurry', actions: ['fix', 'delete'] },
  { document: 'Tax Returns', subdocument: 'Prior Year 1', file: '.xls', status: 'Blurry', actions: ['fix', 'delete'] },
  { document: 'ID', subdocument: 'Driver\'s License', file: 'id.jpeg', status: 'Good', actions: ['delete'] },
  { document: 'ID', subdocument: 'Passport', file: '', status: 'Missing', actions: [] },
];

const guarantorDocs = [
  { document: 'Guarantor ID', subdocument: 'Passport', file: '', status: 'Missing', actions: [] },
  { document: 'Guarantor Proof of Address', subdocument: 'Lease', file: '', status: 'Missing', actions: [] },
  { document: 'Guarantor Tax Return', subdocument: '2022', file: '', status: 'Missing', actions: [] },
  { document: 'Guarantor Bank Statement', subdocument: 'Feb 2023', file: '', status: 'Missing', actions: [] },
];

const businessDocs = [
  { document: 'Business License', subdocument: 'State', file: 'license.pdf', status: 'Good', actions: ['delete'] },
  { document: 'Articles of Incorporation', subdocument: 'Articles', file: 'articles.pdf', status: 'Good', actions: ['delete'] },
  { document: 'Business Tax Return', subdocument: '2022', file: '', status: 'Missing', actions: [] },
  { document: 'Business Bank Statement', subdocument: 'Mar 2023', file: 'biz_bank_mar.pdf', status: 'Good', actions: ['delete'] },
];

// Helper function to check if all documents in a section are complete
function sectionStatus(docs: any[]) {
  const completed = docs.filter((d: any) => d.status === 'Good').length;
  return {
    completed,
    total: docs.length,
    isComplete: completed === docs.length,
  };
}

export const Route = createFileRoute('/_authed/_mainLayout/upload/submit')({
  component: SubmitPage,
});

function SubmitPage() {
  const [note, setNote] = useState('');
  
  // Calculate completion status based on document uploads
  const ownerStatus = sectionStatus(ownerDocs);
  const guarantorStatus = sectionStatus(guarantorDocs);
  const businessStatus = sectionStatus(businessDocs);
  
  // Calculate completion status
  const sections = [
    { name: 'Owner', complete: ownerStatus.isComplete },
    { name: 'Guarantor', complete: guarantorStatus.isComplete },
    { name: 'Business', complete: businessStatus.isComplete }
  ];
  
  const allComplete = ownerStatus.isComplete && guarantorStatus.isComplete && businessStatus.isComplete;
  
  return (
    <>
        {/* Main Content */}
        <Box className={styles.mainContent}>
            <Stack gap="xl">
                <Stack gap="xs" align="center">
                    <Text size="xl" fw={600}>
                        Application Submission
                    </Text>
                    <Text size="sm" c="dimmed">
                        Review summary and confirm it before submitting.
                    </Text>
                </Stack>

                {/* Documents Section */}
                <Paper p="xl" radius="md" className={styles.documentSection}>
                    <Stack gap="lg">
                        <Text className={styles.sectionTitle}>
                            Documents and Information
                        </Text>

                        <Stack gap="md">
                            {sections.map((section) => (
                                <Flex 
                                    key={section.name}
                                    align="center" 
                                    gap="sm" 
                                    className={`${styles.documentItem} ${section.complete ? styles.documentItemComplete : styles.documentItemIncomplete}`}
                                >
                                    <Box
                                        className={`${styles.statusIcon} ${section.complete ? styles.statusIconComplete : styles.statusIconIncomplete}`}
                                    >
                                        {section.complete ? (
                                            <IconCheck size={12} color="#51cf66" />
                                        ) : (
                                            <IconAlertCircle size={12} color="#ffc107" />
                                        )}
                                    </Box>
                                    <Text size="sm" c={section.complete ? "dimmed" : "dark"}>
                                        {section.name}
                                    </Text>
                                </Flex>
                            ))}
                        </Stack>

                        {/* Note Section */}
                        <Stack gap="sm" mt="sm">
                            <Text className={styles.sectionTitle}>
                                Note
                            </Text>
                            <Textarea
                                placeholder="Add a note for the reviewer (optional)"
                                value={note}
                                onChange={(e) => setNote(e.currentTarget.value)}
                                rows={4}
                                className={styles.noteTextarea}
                            />
                        </Stack>

                        <Divider mt="sm"/>

                        <Group justify="space-between">
                            <Button 
                                color="dark"  
                                className={styles.submitButton}
                                disabled={!allComplete}
                                component={Link} to="/upload/confirmation"
                            >
                                Submit
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    </>
  );
} 
