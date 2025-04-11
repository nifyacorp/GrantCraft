import React from 'react';
import { format } from 'date-fns';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <div className="flex items-center mb-1">
          <span className="font-medium">
            {isUser ? 'You' : 'GrantCraft'}
          </span>
          <span className="text-xs ml-2 opacity-70">
            {format(timestamp, 'h:mm a')}
          </span>
          {isStreaming && !isUser && (
            <span className="ml-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary inline" />
            </span>
          )}
        </div>
        <div className="prose-sm">
          <ReactMarkdown>
            {message.content ?? ''}
          </ReactMarkdown>
          {isStreaming && !isUser && (!message.content || message.content === '') && (
            <span className="inline-block w-1 h-4 bg-primary animate-pulse"></span>
          )}
        </div>
        
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 border-t pt-2 text-sm">
            <p className="font-medium">Using tools:</p>
            {message.toolCalls.map((toolCall, index) => (
              <div key={toolCall.id} className="mt-1">
                <p className="font-medium">{toolCall.name}</p>
                {toolCall.result && (
                  <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto mt-1">
                    {typeof toolCall.result === 'object' 
                      ? JSON.stringify(toolCall.result, null, 2) 
                      : toolCall.result}
                  </pre>
                )}
                {toolCall.error && (
                  <p className="text-error text-xs mt-1">{toolCall.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem; 