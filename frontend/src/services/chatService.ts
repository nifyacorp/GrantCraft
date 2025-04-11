import apiService from './apiService';
import { Chat, Message } from '@/types';

class ChatService {
  private baseEndpoint = '/chats';

  async getChats() {
    return apiService.get<Chat[]>(this.baseEndpoint);
  }

  async getChatById(id: string) {
    return apiService.get<Chat>(`${this.baseEndpoint}/${id}`);
  }

  async createChat(title: string) {
    return apiService.post<Chat>(this.baseEndpoint, { title });
  }

  async deleteChat(id: string) {
    return apiService.delete(`${this.baseEndpoint}/${id}`);
  }

  async sendMessage(chatId: string, content: string) {
    return apiService.post<Message>(`${this.baseEndpoint}/${chatId}/messages`, {
      content,
    });
  }

  async getMessages(chatId: string) {
    return apiService.get<Message[]>(`${this.baseEndpoint}/${chatId}/messages`);
  }

  async deleteMessage(chatId: string, messageId: string) {
    return apiService.delete(`${this.baseEndpoint}/${chatId}/messages/${messageId}`);
  }
  
  async streamResponse(chatId: string, content: string, onChunk: (chunk: string) => void) {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const url = `${apiUrl}${this.baseEndpoint}/${chatId}/messages/stream`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to stream response');
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        fullMessage += chunk;
        onChunk(chunk);
      }
      
      return { 
        data: {
          id: `temp-${Date.now()}`, 
          chatId,
          content: fullMessage, 
          role: 'assistant', 
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        } as Message,
        status: 200
      };
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }
}

// Export as singleton
export default new ChatService(); 