import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useChat = (profile, activeChannelId) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannelId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    };
    fetchMessages();

    const chatChannel = supabase
      .channel(`chat_${activeChannelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${activeChannelId}`
      }, (p) => {
        setMessages((prev) => [...prev, p.new]);
      })
      .subscribe();

    return () => { chatChannel.unsubscribe(); };
  }, [activeChannelId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannelId) return;
    await supabase.from('messages').insert([{
      user_name: profile.displayName,
      content: inputText,
      avatar_url: profile.avatarUrl,
      channel_id: activeChannelId
    }]);
    setInputText('');
  };

  return { messages, inputText, setInputText, handleSendMessage };
};
