'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from '../lib/supabaseClient';

interface Track {
  id: string;
  name: string;
  url: string;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Charger les pistes depuis Supabase au démarrage
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const { data, error } = await supabase.from('rires').select('*').order('inserted_at', { ascending: true });
    if (error) console.error(error);
    else setTracks(data.map(track => ({ ...track, url: track.url })));
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
    }
  };

  const deleteTrack = async (track: Track) => {
    const path = track.url.split('/').pop()!;
    await supabase.storage.from('rires').remove([path]);
    await supabase.from('rires').delete().eq('id', track.id);
    setTracks(tracks.filter(t => t.id !== track.id));
    if (currentTrack?.id === track.id) {
      audioRef.current?.pause();
      setCurrentTrack(null);
    }
  };

  const renameTrack = async (track: Track) => {
    const newName = prompt("Nouveau nom de la piste :", track.name);
    if (!newName) return;

    await supabase.from('rires').update({ name: newName }).eq('id', track.id);
    setTracks(tracks.map(t => t.id === track.id ? { ...t, name: newName } : t));
    if (currentTrack && currentTrack.id === track.id) {
      setCurrentTrack({ ...currentTrack, name: newName });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-b from-pink-100 to-pink-300">
      <h1 className="text-4xl font-bold mb-6 text-pink-800">Les rires de Yasmine</h1>

      <ul className="w-full max-w-xl space-y-2">
        {tracks.map((track) => (
          <li key={track.id} className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
            <span className="font-medium text-black">{track.name}t</span>
            <div className="flex gap-2">
              <button
                onClick={() => playTrack(track)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                ▶ Écouter
              </button>
              {/* <button
                onClick={() => renameTrack(track)}
                className="px-3 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
              >
                ✏️ Renommer
              </button>
              <button
                onClick={() => deleteTrack(track)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                🗑️ Supprimer
              </button> */}
            </div>
          </li>
        ))}
      </ul>

      <audio ref={audioRef} controls className="mt-6 w-full max-w-xl" />
    </main>
  );
}