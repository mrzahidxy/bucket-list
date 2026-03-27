import { ResetPasswordClient } from "@/app/(auth)/reset-password/ResetPasswordClient";

type ResetPasswordPageProps = {
  searchParams?: {
    token?: string | string[];
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps): React.JSX.Element {
  const tokenValue = searchParams?.token;
  const token = Array.isArray(tokenValue) ? tokenValue[0] ?? "" : tokenValue?.trim() ?? "";

  return <ResetPasswordClient token={token} />;
}
