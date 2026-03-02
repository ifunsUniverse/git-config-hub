import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface AIWidgetProps {
  activeModName?: string;
  isModIndexed?: boolean;
}

const TYPING_INDICATOR_DELAY = 1000; // ms

export const AIWidget: React.FC<AIWidgetProps> = ({
  activeModName,
  isModIndexed,
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiWidgetOpen') === 'true';
    }
    return false;
  });
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; text: string; id: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [widgetSize, setWidgetSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedSize = localStorage.getItem('aiWidgetSize');
      return storedSize ? JSON.parse(storedSize) : { width: 380, height: 520 };
    }
    return { width: 380, height: 520 };
  });

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('aiWidgetOpen', String(newState));
      return newState;
    });
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem('aiWidgetOpen', 'false');
  }, []);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      const newMessage = { type: 'user' as const, text: inputMessage.trim(), id: Date.now().toString() };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse = `Hello from AI! You said: "${newMessage.text}"`;
        setMessages((prev) => [...prev, { type: 'ai' as const, text: aiResponse, id: Date.now().toString() }]);
        setIsTyping(false);
      }, TYPING_INDICATOR_DELAY + Math.random() * 1000);
    }
  }, [inputMessage]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeWidget();
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [closeWidget, handleSendMessage],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        closeWidget();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeWidget]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleResize = useCallback(
    (sizes: number[]) => {
      // ResizablePanelGroup gives sizes as percentages, need to convert back to pixels
      // This is a simplified approach, a more robust solution might involve a custom handle
      // or storing the actual pixel dimensions of the parent container.
      // For now, we'll just store the width and height directly from the style.
      const newWidth = widgetRef.current?.offsetWidth || widgetSize.width;
      const newHeight = widgetRef.current?.offsetHeight || widgetSize.height;
      const newSize = { width: newWidth, height: newHeight };
      setWidgetSize(newSize);
      localStorage.setItem('aiWidgetSize', JSON.stringify(newSize));
    },
    [widgetSize],
  );

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={widgetRef}>
      {isOpen && (
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={handleResize}
          className={cn(
            "absolute bottom-[72px] right-0 rounded-2xl shadow-2xl overflow-hidden",
            "bg-slate-900/95 backdrop-blur-md border border-slate-700",
            "transform origin-bottom-right transition-all duration-200 ease-out",
            "group-hover:border-accent group-hover:shadow-accent/50", // Gradient border glow effect
            isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2",
          )}
          style={{ width: widgetSize.width, height: widgetSize.height }}
        >
          <ResizablePanel defaultSize={100} minSize={60}>
            <div className="flex h-full w-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                  {activeModName && (
                    <span className="text-sm text-slate-400 ml-2">({activeModName})</span>
                  )}
                  {isModIndexed !== undefined && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isModIndexed ? "bg-green-500" : "bg-red-500",
                      )}
                      title={isModIndexed ? "Mod indexed" : "Mod not indexed"}
                    />
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={closeWidget} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.type === 'user' ? 'justify-end' : 'justify-start',
                        "opacity-0 animate-fade-in-up", // Animation class
                      )}
                      style={{ animationDelay: `${index * 50}ms` }} // Stagger animation
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted text-muted-foreground rounded-bl-none',
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-lg rounded-bl-none bg-muted p-3">
                        <div className="flex items-center space-x-1">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex items-center p-4 border-t border-slate-700 bg-slate-800/80">
                <Input
                  placeholder="Ask me anything about this mod..."
                  className="flex-1 mr-2 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} size="icon" className="bg-accent hover:bg-accent/90">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-accent to-purple-600 text-white",
          "hover:scale-105 transition-all duration-200",
          "focus:outline-none focus:ring-4 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background",
          "group", // Add group class for hover effects on child elements
        )}
      >
        <Sparkles className="h-7 w-7 transition-all duration-200 group-hover:rotate-12" />
        <span className="sr-only">Toggle AI Assistant</span>
        {/* Subtle glow effect */}
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-accent opacity-0 blur-md",
            "transition-all duration-500",
            "group-hover:opacity-30 group-hover:blur-lg",
            isOpen && "opacity-30 blur-lg",
          )}
        />
      </button>
    </div>
  );
};
