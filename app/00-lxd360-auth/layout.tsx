/**
 * Auth Layout - Centered minimal layout for authentication pages
 */
export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lxd-light-page dark:bg-lxd-dark-page">
      {children}
    </div>
  );
}
