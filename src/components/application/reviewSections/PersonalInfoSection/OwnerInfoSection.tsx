import { Stack, Group, Text, Divider } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { PersonalInfoSection } from './PersonalInfoSection';
import ContactInfoSection from './ContactInfoSection';

export const OwnerInfoSection = () => (
  <Stack gap="xs">
    <Group
      justify="space-between"
      mb={2}
      tabIndex={0}
      aria-label="Owner Information section header"
      pb='xs'
      pl={0}
    >
      <Group gap={8}>
        <IconUser 
            size={35} 
            style={{
                backgroundColor: '#eafbc5ff',
                color: '#75c211ff',
                border: '1px solid #75c211ff',
                borderRadius: '8px',
                marginRight: '10px',
                padding: '5px',
                }}
        />
        <Stack gap={2}>
          <Text fw={600} size="md">Owner Information</Text>
        </Stack>
      </Group>
    </Group>
    <Stack gap="lg">
        <PersonalInfoSection />
        <Divider/>
        <ContactInfoSection />
    </Stack>
  </Stack>
); 
