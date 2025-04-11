import { create } from 'zustand';
import { Chat, Message, ChatSummary } from '@/types';
import chatService from '@/services/chatService';
import { toast } from '@/lib/hooks/use-toast';

interface ChatState {
  chats: ChatSummary[];
  activeChat: Chat | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  streaming: boolean;
  streamingMessage: Message | null;
  error: string | null;

  // Actions
  fetchChats: () => Promise<void>;
  fetchChat: (id: string) => Promise<void>;
  createChat: (title: string) => Promise<string | null>;
  deleteChat: (id: string) => Promise<boolean>;
  sendMessage: (chatId: string, content: string) => Promise<boolean>;
  sendStreamingMessage: (chatId: string, content: string) => Promise<boolean>;
  updateStreamingMessage: (content: string) => void;
  clearActiveChat: () => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  sending: false,
  streaming: false,
  streamingMessage: null,
  error: null,

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.getChats();
      if (response.error) {
        throw new Error(response.error);
      }
      set({ chats: response.data || [], loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  fetchChat: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.getChatById(id);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        set({ 
          activeChat: response.data, 
          messages: response.data.messages || [],
          loading: false 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  createChat: async (title: string) => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.createChat(title);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newChat: ChatSummary = {
          id: response.data.id,
          title: response.data.title,
          userId: response.data.userId,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        
        set(state => ({ 
          chats: [newChat, ...state.chats],
          loading: false 
        }));
        
        return response.data.id;
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  },

  deleteChat: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await chatService.deleteChat(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      set(state => ({ 
        chats: state.chats.filter(chat => chat.id !== id),
        activeChat: state.activeChat?.id === id ? null : state.activeChat,
        loading: false 
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete chat';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  sendMessage: async (chatId: string, content: string) => {
    set({ sending: true, error: null });
    try {
      const response = await chatService.sendMessage(chatId, content);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          // Update messages array with the new message
          const updatedMessages = [...state.messages, response.data!];
          
          // Update activeChat with the latest message if applicable
          const updatedActiveChat = state.activeChat 
            ? {
                ...state.activeChat,
                messages: updatedMessages,
                updatedAt: new Date().toISOString()
              }
            : null;
          
          // Also update the chat in the chat list
          const updatedChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                lastMessage: content,
                updatedAt: new Date().toISOString()
              };
            }
            return chat;
          });
          
          return {
            messages: updatedMessages,
            activeChat: updatedActiveChat,
            chats: updatedChats,
            sending: false
          };
        });
        
        return true;
      }
      
      set({ sending: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      set({ error: errorMessage, sending: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },
  
  sendStreamingMessage: async (chatId: string, content: string) => {
    // First add the user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      chatId,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    set(state => ({
      messages: [...state.messages, userMessage],
      streaming: true,
      // Create empty assistant message to start streaming into
      streamingMessage: {
        id: `assistant-${Date.now()}`,
        chatId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    }));
    
    try {
      // Start the streaming process
      await chatService.streamResponse(chatId, content, (chunk) => {
        set(state => {
          if (!state.streamingMessage) return state;
          
          const updatedContent = state.streamingMessage.content + chunk;
          return {
            streamingMessage: {
              ...state.streamingMessage,
              content: updatedContent
            }
          };
        });
      });
      
      // When streaming is complete, add the final message to the messages array
      set(state => {
        if (!state.streamingMessage) return { streaming: false };
        
        const updatedMessages = [...state.messages, state.streamingMessage];
        
        // Update activeChat with the latest messages
        const updatedActiveChat = state.activeChat 
          ? {
              ...state.activeChat,
              messages: updatedMessages,
              updatedAt: new Date().toISOString()
            }
          : null;
        
        // Update the chat list
        const updatedChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: content,
              updatedAt: new Date().toISOString()
            };
          }
          return chat;
        });
        
        return {
          messages: updatedMessages,
          activeChat: updatedActiveChat,
          chats: updatedChats,
          streaming: false,
          streamingMessage: null
        };
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stream message';
      set({ 
        error: errorMessage, 
        streaming: false,
        streamingMessage: null
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },
  
  updateStreamingMessage: (content: string) => {
    set(state => {
      if (!state.streamingMessage) return state;
      
      return {
        streamingMessage: {
          ...state.streamingMessage,
          content
        }
      };
    });
  },

  clearActiveChat: () => {
    set({ 
      activeChat: null, 
      messages: [],
      streamingMessage: null,
      streaming: false
    });
  }
}));

export default useChatStore; 