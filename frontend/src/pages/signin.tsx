import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import SignInForm from '@/components/auth/SignInForm';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';

const SignInPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const returnUrl = router.query.returnUrl as string || '/dashboard';
  
  useEffect(() => {
    if (!loading && user) {
      router.replace(returnUrl);
    }
  }, [user, loading, router, returnUrl]);
  
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Layout hideHeader>
      <Head>
        <title>Sign In | GrantCraft</title>
      </Head>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Link
          href="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center"
        >
          <span className="font-bold text-xl">GrantCraft</span>
        </Link>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <SignInForm />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage; 