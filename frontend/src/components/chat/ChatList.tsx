import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PlusIcon, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useChatStore from '@/store/chatStore';
import { cn } from '@/lib/utils';

const ChatList: React.FC = () => {
  const router = useRouter();
  const { chats, fetchChats, createChat, deleteChat, loading, error } = useChatStore();
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const chatId = router.query.id as string | undefined;

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatTitle.trim() && !isCreating) {
      setIsCreating(true);
      const newChatId = await createChat(newChatTitle);
      setIsCreating(false);
      setNewChatTitle('');
      setShowNewChatInput(false);
      
      if (newChatId) {
        router.push(`/chats/${newChatId}`);
      }
    }
  };

  const handleShowInput = () => {
    setShowNewChatInput(true);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = window.confirm('Are you sure you want to delete this chat?');
    if (confirmDelete) {
      await deleteChat(id);
      if (chatId === id) {
        router.push('/chats');
      }
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="font-semibold text-lg">Your Chats</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowInput}
          className="p-0 h-8 w-8"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      {showNewChatInput && (
        <form onSubmit={handleCreateChat} className="mb-4 px-4">
          <div className="flex space-x-2">
            <Input
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Chat title..."
              disabled={isCreating}
              className="h-9"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newChatTitle.trim() || isCreating}
            >
              {isCreating ? '...' : 'Create'}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-error text-sm px-4 mb-2">{error}</p>
      )}

      <div className="space-y-1">
        {chats.length === 0 ? (
          <p className="text-muted-foreground text-sm px-4">No chats yet. Start a new conversation!</p>
        ) : (
          chats.map((chat) => (
            <Link href={`/chats/${chat.id}`} key={chat.id}>
              <div
                className={cn(
                  "flex justify-between items-start p-2 px-4 hover:bg-muted rounded cursor-pointer",
                  chatId === chat.id && "bg-muted"
                )}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{chat.title}</h3>
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {chat.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="h-8 w-8 ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList; 