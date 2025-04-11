import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

const Home: NextPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <Layout>
      <Head>
        <title>GrantCraft | AI-Powered Grant Writing Assistant</title>
        <meta
          name="description"
          content="GrantCraft is an AI-powered assistant that helps you write and manage grant proposals more effectively."
        />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Write Better Grants <span className="text-primary">Faster</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
            GrantCraft is your AI-powered assistant for writing competitive grant proposals,
            managing projects, and collaborating with your team.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            {user ? (
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => router.push('/signup')}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/signin')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
              <p className="text-muted-foreground">
                Collaborate with an AI assistant that specializes in grant writing, provides feedback, and answers questions in real-time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Organize your grant application process with task tracking, deadlines, and automated reminders.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Management</h3>
              <p className="text-muted-foreground">
                Store, organize, and collaborate on grant-related documents and files seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-muted-foreground">
                Sign up and set up your organization profile to get started.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Start a Project</h3>
              <p className="text-muted-foreground">
                Create a new grant project and let the AI help you structure your proposal.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Finalize</h3>
              <p className="text-muted-foreground">
                Work with your team and the AI to refine your grant until it's ready for submission.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => router.push(user ? '/dashboard' : '/signup')}>
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home; 