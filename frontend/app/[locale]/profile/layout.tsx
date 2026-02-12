type ProfileLayoutProps = {
  children: React.ReactNode;
};

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return children;
}
