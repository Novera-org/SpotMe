import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  
  const target = callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-in";
    
  redirect(target);
}
