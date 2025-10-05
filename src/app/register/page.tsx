'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Check, ChromeIcon } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing up with Google', error);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-5xl font-bold text-primary">Create an Account</h1>
          <p className="mt-2 text-lg text-muted-foreground">Get started with TaskMaster Pro.</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="space-y-6">
            <Button
              onClick={handleSignUp}
              className="w-full"
              size="lg"
            >
              <ChromeIcon className="mr-2 h-5 w-5" />
              Sign up with Google
            </Button>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Full CRUD for tasks</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Filter by status and sort by due date</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Secure authentication with Firebase</span>
                </li>
            </ul>
             <p className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
         <p className="text-center text-xs text-muted-foreground">
            A simplified MERN-stack experience powered by Next.js and Firebase.
        </p>
      </div>
    </div>
  );
}
