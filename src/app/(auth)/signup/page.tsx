import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");
  return (
    <div className="container-page py-10">
      <AuthForm mode="signup" />
    </div>
  );
}
