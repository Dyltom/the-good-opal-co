// Minimal root layout - route groups handle their own html/body
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
