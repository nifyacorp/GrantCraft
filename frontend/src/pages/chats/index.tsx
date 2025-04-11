import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ChatList from '@/components/chat/ChatList';

const ChatsPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Chats | GrantCraft</title>
      </Head>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r overflow-y-auto">
          <ChatList />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Welcome to Chats</h1>
            <p className="text-muted-foreground mb-4">
              Select a chat from the sidebar or create a new one to start a conversation.
            </p>
            <p className="text-muted-foreground">
              You can ask for help with grant writing, project planning, budgeting, and more.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatsPage; 