import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import useChatStore from '@/store/chatStore';

interface ChatWindowProps {
  chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const { 
    activeChat, 
    messages, 
    streamingMessage, 
    streaming, 
    loading, 
    sending, 
    fetchChat, 
    sendMessage,
    sendStreamingMessage 
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    }
  }, [chatId, fetchChat]);

  useEffect(() => {
    // Scroll to bottom when messages change or when streaming content updates
    scrollToBottom();
  }, [messages, streamingMessage?.content]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string) => {
    if (chatId) {
      // Use streaming message function instead of regular send
      await sendStreamingMessage(chatId, content);
    }
  };

  if (loading && !activeChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeChat && !loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No chat selected</h3>
        <p className="text-muted-foreground">Select a chat from the sidebar or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">{activeChat?.title || 'Chat'}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Start a conversation</h3>
            <p className="text-muted-foreground">Ask questions about grant writing, project planning, or get assistance with your tasks.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            
            {/* Show streaming message if available */}
            {streamingMessage && (
              <MessageItem 
                key={streamingMessage.id} 
                message={streamingMessage} 
                isStreaming={streaming} 
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSend={handleSend} disabled={sending || streaming} />
    </div>
  );
};

export default ChatWindow; 