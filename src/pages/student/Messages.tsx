import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Gonca Yoldaş',
      role: 'Eğitmen',
      lastMessage: 'Ders materyallerini gönderdim',
      time: '10 dakika önce',
      unread: 2,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      name: 'Destek Ekibi',
      role: 'Destek',
      lastMessage: 'Size nasıl yardımcı olabiliriz?',
      time: '2 saat önce',
      unread: 0,
      avatar: null
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Gonca Yoldaş',
      text: 'Merhaba! Bugünkü ders için hazırlıklı mısınız?',
      time: '09:30',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Siz',
      text: 'Evet, hazırız! Teşekkür ederim.',
      time: '09:35',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Gonca Yoldaş',
      text: 'Harika! Ders materyallerini gönderdim, lütfen kontrol edin.',
      time: '09:40',
      isOwn: false
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic here
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Mesajlar</h1>
        <p className="text-[var(--fg-muted)] mt-2">Eğitmenleriniz ve destek ekibi ile iletişim</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-[var(--fg)]">Konuşmalar</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input
                placeholder="Ara..."
                className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-[var(--color-primary)]/10'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-[var(--fg)] text-sm">{conversation.name}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {conversation.role}
                          </Badge>
                        </div>
                        {conversation.unread > 0 && (
                          <Badge className="bg-[var(--color-primary)]">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--fg-muted)] truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[var(--fg-muted)] mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{conversation.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)] lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <CardTitle className="text-[var(--fg)]">
                      {conversations.find(c => c.id === selectedConversation)?.name}
                    </CardTitle>
                    <CardDescription className="text-[var(--fg-muted)]">
                      {conversations.find(c => c.id === selectedConversation)?.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOwn
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--bg-hover)] text-[var(--fg)]'
                        }`}
                      >
                        {!message.isOwn && (
                          <p className="text-xs font-semibold mb-1">{message.sender}</p>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-white/70' : 'text-[var(--fg-muted)]'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-[var(--border)] p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Mesajınızı yazın..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
                    />
                    <Button onClick={handleSendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
                <p className="text-[var(--fg-muted)]">
                  Bir konuşma seçin veya yeni bir mesaj başlatın
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
