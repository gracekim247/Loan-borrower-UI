import { createFileRoute } from '@tanstack/react-router';
import { Stack, Divider } from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import { IconUser, IconCash, IconBuilding } from '@tabler/icons-react';
import { ExpandableIconLink } from "~/components/root/ExpandableIconLink";
import { useNavbar } from '../../_mainLayout';

import { OwnerInfoSection } from '../../../../components/application/reviewSections/PersonalInfoSection/OwnerInfoSection';
import { FinancialAndLiabilitiesSection } from '../../../../components/application/reviewSections/FinancialStatementSection/FinancialAndLiabilitiesSection';
import { BusinessInfoSection } from '../../../../components/application/reviewSections/BusinessInfoSection/BusinessInfoSection';

// Navigation configuration for review page sections
const reviewSections = [
    {
        key: 'owner-info',
        label: 'Owner Information',
        icon: IconUser,
        sectionId: 'section-0'
    },
    {
        key: 'financial-statement',
        label: 'Financial Statement',
        icon: IconCash,
        sectionId: 'section-1'
    },
    {
        key: 'company-info',
        label: 'Company Information',
        icon: IconBuilding,
        sectionId: 'section-2'
    }
];

export const Route = createFileRoute('/_authed/_mainLayout/upload/review')({
    component: ReviewPage,
});

function ReviewPage() {
    const [activeSection, setActiveSection] = useState(0);
    const { expanded, addNavItem, clearNavItems } = useNavbar();

    // Memoize the navigation items to prevent unnecessary re-renders
    const navigationItems = useMemo(() => {
        return reviewSections.map(section => (
            <ExpandableIconLink
                key={section.key}
                icon={<section.icon size={20} />}
                label={section.label}
                to="/upload/review"
                expanded={expanded}
                onClick={() => {
                    const element = document.getElementById(section.sectionId);
                    if (element) {
                        const headerHeight = 80;
                        const elementPosition = element.offsetTop - headerHeight - 20;
                        window.scrollTo({
                            top: elementPosition,
                            behavior: 'smooth'
                        });
                    }
                }}
            />
        ));
    }, [expanded]);

    // Add review page navigation links to navbar
    useEffect(() => {
        // Clear any existing nav items
        clearNavItems();
        
        // Add review-specific navigation links
        navigationItems.forEach(item => {
            addNavItem(item);
        });

        // Cleanup function to clear nav items when component unmounts
        return () => {
            clearNavItems();
        };
    }, [navigationItems, addNavItem, clearNavItems]);

    // Track which section is currently in view
    useEffect(() => {
        const handleScroll = () => {
        const sections = ['section-0', 'section-1', 'section-2'];
        const scrollPosition = window.scrollY + 100; // Offset for top bar
        for (let i = sections.length - 1; i >= 0; i--) {
            const element = document.getElementById(sections[i]);
            if (element && element.offsetTop <= scrollPosition) {
            setActiveSection(i);
            break;
            }
        }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <>
        {/* Main Content */}
        <Stack gap="xl">
            {/* Owner Information Section */}
            <div id="section-0">
                <OwnerInfoSection />
            </div>

            <Divider />

            {/* Financial Statement Section */}
            <div id="section-1">
                <FinancialAndLiabilitiesSection />
            </div>

            <Divider />

            {/* Business Information Section */}
            <div id="section-2">
                <BusinessInfoSection />
            </div>
        </Stack>
    </>
  );
} 
