import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { cn } from '@/utils/helpers';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const pageContextMap: Record<string, { page: string; title: string; hint: string }> = {
  '/team': { page: 'team', title: 'Team Assistant', hint: 'Try: add employees, list team' },
  '/clients': { page: 'clients', title: 'Client Assistant', hint: 'Try: add clients, list clients' },
  '/projects': { page: 'projects', title: 'Project Assistant', hint: 'Try: add projects, list projects' },
  '/tasks': { page: 'tasks', title: 'Task Assistant', hint: 'Try: add tasks, list tasks' },
  '/dashboard': { page: 'dashboard', title: 'Dashboard Assistant', hint: 'Try: list employees, list projects' },
};

export default function AIAssistant() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentContext = pageContextMap[location.pathname] || {
    page: 'general',
    title: 'Command Assistant',
    hint: 'Type help for commands'
  };

  // Reset messages when page changes
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `**${currentContext.title}**\n\n${currentContext.hint}\n\nType **help** for all commands.`,
      timestamp: new Date(),
    }]);
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiAssistantService.chat(message, { page: currentContext.page }),
    onSuccess: (response: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error.response?.data?.message || error.message || 'Failed to process request'}`,
          timestamp: new Date(),
          success: false,
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput('');
    chatMutation.mutate(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Chat cleared! Type **help** for commands.`,
      timestamp: new Date(),
    }]);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-r from-redstone-500 to-redstone-600 hover:from-redstone-600 hover:to-redstone-700',
          'text-white',
          isOpen && 'hidden'
        )}
        title="Open Command Assistant"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[420px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden transition-all duration-300 transform',
          'border border-gray-200 dark:border-gray-700',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-redstone-500 to-redstone-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{currentContext.title}</h3>
              <p className="text-xs text-white/80">Powered by Claude AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[90%] rounded-xl px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-redstone-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                )}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  className="whitespace-pre-wrap text-sm"
                />
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-redstone-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-redstone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-redstone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command or paste data..."
              rows={1}
              className={cn(
                'flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                'px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-redstone-500',
                'max-h-24'
              )}
              style={{ minHeight: '38px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 96) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-redstone-500 hover:bg-redstone-600 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
