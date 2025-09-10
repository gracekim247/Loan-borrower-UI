import {
	SignedIn,
	SignedOut,
	UserButton,
	useOrganization,
	useUser,
} from "@clerk/tanstack-react-start";
import { Home01Icon, UserMultiple03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppShell, Avatar, Flex, Skeleton, Stack, Text, Box, Group, Button, Divider } from "@mantine/core";
import { createFileRoute, Outlet, useLocation, Link } from "@tanstack/react-router";
import { useState, createContext, useContext, ReactNode, useCallback, useEffect } from "react";
import { ExpandableIconLink } from "~/components/root/ExpandableIconLink";
import { UploadFlowIndicator } from "~/components/application/UploadFlowIndicator";
import classes from "./_mainLayout.module.css";

// Context for navbar navigation
interface NavbarContextType {
  expanded: boolean;
  addNavItem: (item: ReactNode) => void;
  clearNavItems: () => void;
}

// Context for header content
interface HeaderContextType {
  setHeaderContent: (content: ReactNode) => void;
  clearHeaderContent: () => void;
}

export const NavbarContext = createContext<NavbarContextType | null>(null);
export const HeaderContext = createContext<HeaderContextType | null>(null);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

export const Route = createFileRoute("/_authed/_mainLayout")({
	component: RouteComponent,
});

function RouteComponent() {
	const { organization } = useOrganization();
	const { user } = useUser();
	const [expanded, setExpanded] = useState(false);
	const [navItems, setNavItems] = useState<ReactNode[]>([]);
	const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);
	const location = useLocation();
	
	// Check if we're in the upload flow
	const isUploadFlow = location.pathname.startsWith('/upload');
	const currentStep = isUploadFlow ? 
		(location.pathname.includes('/confirmation') ? 'submit' :
		 location.pathname.includes('/submit') ? 'submit' :
		 location.pathname.includes('/review') ? 'review' : 'upload') : null;
	
	const addNavItem = useCallback((item: ReactNode) => {
		setNavItems(prev => [...prev, item]);
	}, []);
	
	const clearNavItems = useCallback(() => {
		setNavItems([]);
	}, []);

	const setHeaderContentHandler = useCallback((content: ReactNode) => {
		setHeaderContent(content);
	}, []);

	const clearHeaderContentHandler = useCallback(() => {
		setHeaderContent(null);
	}, []);

	// Set CSS custom property for navbar state
	useEffect(() => {
		document.documentElement.style.setProperty(
			'--navbar-width', 
			expanded ? '230px' : '70px'
		);
	}, [expanded]);
	
	return (
		<NavbarContext.Provider value={{ expanded, addNavItem, clearNavItems }}>
			<HeaderContext.Provider value={{ setHeaderContent: setHeaderContentHandler, clearHeaderContent: clearHeaderContentHandler }}>
			<AppShell
				navbar={{
					width: { base: 70, sm: expanded ? 230 : 70 },
					breakpoint: "sm",
					collapsed: { mobile: false },
				}}
				header={{
					height: isUploadFlow ? 80 : 100,
				}}
				footer={{
					height: isUploadFlow ? 80 : 0,
				}}
				padding="md"
				layout="alt"
			>
				<AppShell.Navbar
					p="md"
					className={`${classes.navbar} ${expanded ? classes.navbarHover : ""}`}
					onMouseEnter={() => setExpanded(true)}
					onMouseLeave={() => setExpanded(false)}
				>
					<AppShell.Section>
						<Skeleton circle visible={!organization}>
							<Flex align={"center"} gap={8}>
								<Avatar
									src={organization?.imageUrl}
									alt={organization?.name}
									radius={"xs"}
								/>
								{expanded && (
									<Text variant="text" size="lg" fw={600}>
										{organization?.name}
									</Text>
								)}
							</Flex>
						</Skeleton>
					</AppShell.Section>
					<AppShell.Section grow my="md" w={"100%"}>
						<Stack gap={4}>
							<ExpandableIconLink
								icon={<HugeiconsIcon icon={Home01Icon} />}
								label="Dashboard"
								to="/dashboard"
								expanded={expanded}
							/>
                            <Divider />
							{/* Page-specific navigation injected here */}
							{navItems}
						</Stack>
					</AppShell.Section>
					<AppShell.Section w={"100%"}>
						<SignedIn>
							<Flex align="center" justify="start" className={classes.userButton}>
								<UserButton />
								{expanded && (
									<Text pl={8} variant="text" size="md" fw={600}>
										{user?.fullName}
									</Text>
								)}
							</Flex>
						</SignedIn>
						<SignedOut>
							<ExpandableIconLink
								icon={<HugeiconsIcon icon={UserMultiple03Icon} />}
								label="Sign In"
								to="/"
								expanded={expanded}
							/>
						</SignedOut>
					</AppShell.Section>
				</AppShell.Navbar>

				{/* Fixed Header */}
				<AppShell.Header p="md" className={classes.fixedHeader}>
					{isUploadFlow ? (
						<Group justify="space-between" align="center" className={classes.uploadHeader}>
							<Box style={{ flex: 1 }}>
								<UploadFlowIndicator 
									currentStep={currentStep as 'upload' | 'review' | 'submit'}
									onStepClick={(step) => {
										if (step === 'upload') window.location.href = '/upload';
										if (step === 'review') window.location.href = '/upload/review';
										if (step === 'submit') window.location.href = '/upload/submit';
									}}
								/>
							</Box>
							{location.pathname.includes('/confirmation') && (
								<Button variant='outline' color='red' component={Link} to="/dashboard">
									Exit
								</Button>
							)}
						</Group>
					) : (
						<Box className={classes.defaultHeader}>
							{headerContent || (
								<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
									<h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>Dashboard</h2>
									<p style={{ margin: 0, color: "#6c757d", fontSize: "1rem" }}>
										Loan Application Portal
									</p>
								</div>
							)}
						</Box>
					)}
				</AppShell.Header>

				<AppShell.Main
					display={"flex"}
					className={classes.mainContent}
					data-upload-flow={isUploadFlow}
				>
					<Outlet />
				</AppShell.Main>

				{/* Conditional Footer */}
				{isUploadFlow && location.pathname !== '/upload/submit' && location.pathname !== '/upload/confirmation' && (
					<AppShell.Footer p="md" className={classes.fixedFooter}>
						{location.pathname === '/upload' && (
							<Group justify="end">
								<Button component={Link} to="/upload/review">
									Next
								</Button>
							</Group>
						)}
						{location.pathname === '/upload/review' && (
							<Group justify="space-between">
								<Box>
									<Text c='dimmed' fz='sm'>
										Missing information 9/9
									</Text>
									<Text c='dimmed' fz='xs'>
										Please complete the missing fields before continuing with your application.
									</Text>
								</Box>
								<Button component={Link} to="/upload/submit">
									Next
								</Button>
							</Group>
						)}
					</AppShell.Footer>
				)}
			</AppShell>
			</HeaderContext.Provider>
		</NavbarContext.Provider>
	);
}
