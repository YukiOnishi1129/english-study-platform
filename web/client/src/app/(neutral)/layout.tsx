export default function NeutralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication check - accessible by anyone
  return <>{children}</>;
}
