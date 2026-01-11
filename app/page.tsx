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
    <>
      {/* Arrière-plan psychédélique */}
      <div className="retro-wave-bg"></div>
      <div className="psychedelic-circles"></div>
      
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Header groovy avec logo psychédélique */}
        <div className="text-center mb-12">
          <div className="inline-block relative">
            {/* Effet de halo coloré */}
            <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-orange-400 via-purple-500 to-pink-500 rounded-full scale-110"></div>
            <h1 className="text-7xl md:text-8xl font-bold mb-4 groovy-text relative">
              Les Rires
            </h1>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold groovy-text">
            de Yasmine ✌️
          </h2>
          <div className="mt-4 flex justify-center gap-3">
            <span className="text-4xl animate-[float_3s_ease-in-out_infinite]">🌻</span>
            <span className="text-4xl animate-[float_3s_ease-in-out_infinite_0.5s]">☮️</span>
            <span className="text-4xl animate-[float_3s_ease-in-out_infinite_1s]">🎵</span>
          </div>
        </div>

        {tracks.length === 0 ? (
          <div className="groovy-card p-8 text-center max-w-md">
            <p className="text-2xl font-semibold" style={{ color: 'var(--earth-brown)' }}>
              Aucun son ajouté pour le moment, Yasmine bouge ton gros cul 🕺
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="groovy-card p-6 flex justify-between items-center gap-4 animate-[groovy-pulse_2s_ease-in-out_infinite]"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icône vinyl tournante */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-2xl animate-[rotate-rainbow_10s_linear_infinite]">
                    💿
                  </div>
                  <span className="font-semibold text-xl truncate" style={{ color: 'var(--dark-chocolate)' }}>
                    {track.name}
                  </span>
                </div>
                
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => playTrack(track)}
                    className="retro-button px-6 py-3 rounded-full font-bold text-white cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, var(--groovy-orange), var(--sunset-red))',
                    }}
                  >
                    ▶ Play
                  </button>
                  {/* <button
                    onClick={() => renameTrack(track)}
                    className="retro-button px-4 py-3 rounded-full font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--mustard-yellow), var(--sunset-red))',
                      color: 'var(--dark-chocolate)',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTrack(track)}
                    className="retro-button px-4 py-3 rounded-full font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--psychedelic-pink), var(--vintage-purple))',
                    }}
                  >
                    🗑️
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Player audio avec style vintage */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="groovy-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🎧</span>
              <span className="font-bold text-xl" style={{ color: 'var(--earth-brown)' }}>
                {currentTrack ? `En écoute: ${currentTrack.name}` : 'Lecteur Groovy'}
              </span>
            </div>
            <audio ref={audioRef} controls className="w-full" />
          </div>
        </div>
      </main>
    </>
  );
}