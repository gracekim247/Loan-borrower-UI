import { Stack, Group, Text } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';
import { FinancialStatementSection } from './FinancialStatementSection';
import { ContingentLiabilitiesSection } from './ContingentLiabilitiesSection';

export const FinancialAndLiabilitiesSection = () => (
  <Stack gap="xs">
    <Group
      justify="space-between"
      mb={2}
      tabIndex={0}
      aria-label="Financial & Liabilities section header"
      pb='sm'
      pl={0}
    >
      <Group gap={8}>
        <IconCash 
          size={35} 
          style={{
            backgroundColor: '#eee2fbff',
            color: '#674bbcff', 
            border: '1px solid #674bbcff',
            borderRadius: '8px', 
            marginRight: '10px',
            padding: '5px'
            }}
        />
        <Stack gap={2}>
          <Text fw={600} size="md">Financial Statement</Text>
        </Stack>
      </Group>
    </Group>
    <Stack gap="lg">
        <FinancialStatementSection />
        <ContingentLiabilitiesSection />
    </Stack>
  </Stack>
); 
