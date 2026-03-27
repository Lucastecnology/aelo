import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (data) setChannels(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();

    const channelSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        fetchChannels(); // refetch on any addition, deletion, or name update
      })
      .subscribe();

    return () => { channelSubscription.unsubscribe(); };
  }, []);

  const createChannel = async (name, type) => {
    if (!name.trim()) return;
    await supabase.from('channels').insert([{ name, type, order_index: channels.length }]);
  };

  const updateChannelName = async (id, newName) => {
    if (!newName.trim()) return;
    await supabase.from('channels').update({ name: newName }).eq('id', id);
  };

  const deleteChannel = async (id) => {
    await supabase.from('channels').delete().eq('id', id);
  };

  const updateChannelOrder = async (orderedIds) => {
    // updates the frontend instantly for snappy interaction
    const reorderedChannels = [...channels];
    reorderedChannels.sort((a, b) => {
      const indexA = orderedIds.indexOf(a.id);
      const indexB = orderedIds.indexOf(b.id);
      if (indexA === -1 || indexB === -1) return 0;
      return indexA - indexB;
    });
    setChannels(reorderedChannels);

    // execute batched updates in Supabase
    const updates = orderedIds.map((id, idx) => 
      supabase.from('channels').update({ order_index: idx }).eq('id', id)
    );
    await Promise.all(updates);
  };

  return { channels, loading, createChannel, updateChannelName, deleteChannel, updateChannelOrder };
};
