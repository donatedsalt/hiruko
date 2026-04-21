import { ThemeChangeButton } from "@/components/theme-change-button";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ThemeChangeButton className="fixed bottom-6 left-6" />
    </>
  );
}
