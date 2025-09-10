import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div style={{ 
			display: "flex", 
			justifyContent: "center", 
			alignItems: "center", 
			minHeight: "100vh" 
		}}>
			<SignIn />
		</div>
	);
} 
