type AdminLayoutProps = {
  children: React.ReactNode;
};

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
