import { Button } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import classes from "./ExpandableIconLink.module.css";
export interface ExpandableIconLinkProps {
	icon: React.ReactNode;
	label: string;
	to?: LinkProps["to"];
	expanded?: boolean;
	onClick?: () => void;
}

export const ExpandableIconLink = (props: ExpandableIconLinkProps) => {
	return (
		<Button
			component={props.onClick ? undefined : Link}
			to={props.onClick ? undefined : props.to}
			variant="subtle"
			className={classes.linkButton}
			color="dark"
			onClick={props.onClick}
            leftSection={props.icon} 
		>
			{props.expanded ? props.label : ""}
		</Button>
	);
};
