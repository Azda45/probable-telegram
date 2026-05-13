import "./overlay.css";

export const metadata = {
  title: "DonasiKu Overlay",
};

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
