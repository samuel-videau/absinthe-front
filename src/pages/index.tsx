import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/campaigns'); // Redirect to campaigns page by default
  }, [router]);

  return null;
}
