export function MyPostLabelsButton() {
  return (
    <a
      className="btn btn--style-secondary btn--size-medium"
      href="/api/admin/orders/mypost-csv"
      download
    >
      Download Australia Post labels CSV
    </a>
  )
}
