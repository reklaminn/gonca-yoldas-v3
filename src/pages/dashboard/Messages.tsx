import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Paperclip, MoreVertical } from 'lucide-react';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Gonca Yoldaş',
      role: 'Eğitmen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Ders materyallerini gönderdim',
      time: '10 dakika önce',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      role: 'Eğitmen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      lastMessage: 'Yarınki ders için hazır mısınız?',
      time: '2 saat önce',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Destek Ekibi',
      role: 'Destek',
      avatar: null,
      lastMessage: 'Size nasıl yardımcı olabiliriz?',
      time: '1 gün önce',
      unread: 0,
      online: true
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Gonca Yoldaş',
      text: 'Merhaba! Bugünkü dersiniz için materyalleri hazırladım.',
      time: '09:30',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Ben',
      text: 'Teşekkür ederim! Materyalleri inceleyeceğim.',
      time: '09:35',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Gonca Yoldaş',
      text: 'Harika! Herhangi bir sorunuz olursa çekinmeden sorabilirsiniz.',
      time: '09:40',
      isOwn: false
    },
    {
      id: 4,
      sender: 'Ben',
      text: 'Elbette, teşekkürler!',
      time: '09:42',
      isOwn: true
    },
    {
      id: 5,
      sender: 'Gonca Yoldaş',
      text: 'Ders materyallerini gönderdim. PDF dosyasını inceleyebilirsiniz.',
      time: '10:15',
      isOwn: false
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle message sending
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mesajlar</h1>
        <p className="text-muted-foreground mt-2">Eğitmenleriniz ve destek ekibiyle iletişim kurun</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mesajlarda ara..."
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.avatar || undefined} />
                      <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{conversation.role}</p>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge className="bg-primary text-white">{conversation.unread}</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.avatar || undefined} />
                  <AvatarFallback>
                    {conversations.find(c => c.id === selectedConversation)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {conversations.find(c => c.id === selectedConversation)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.role}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-semibold mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
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
                className="min-h-[60px] resize-none"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
