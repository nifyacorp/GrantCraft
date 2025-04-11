import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatList from '@/components/chat/ChatList';
import useChatStore from '@/store/chatStore';

const ChatPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { activeChat, clearActiveChat } = useChatStore();
  
  // Clear active chat when leaving the page
  useEffect(() => {
    return () => {
      clearActiveChat();
    };
  }, [clearActiveChat]);
  
  return (
    <Layout>
      <Head>
        <title>{activeChat?.title ? `${activeChat.title} | ` : ''}Chats | GrantCraft</title>
      </Head>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r overflow-y-auto">
          <ChatList />
        </div>
        <div className="flex-1">
          {id && typeof id === 'string' ? (
            <ChatWindow chatId={id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Select a chat to view</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage; 