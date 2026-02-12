type CheckoutLayoutProps = {
  children: React.ReactNode;
};

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return children;
}
