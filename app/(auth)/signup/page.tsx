import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function SignUpPage(): Promise<React.JSX.Element> {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <AuthForm mode="signup" />;
}
