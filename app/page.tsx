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

  const handleDrop = async (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type === "audio/mpeg" || file.type === "audio/mp4"
    );

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage.from('rires').upload(fileName, file);
      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage.from('rires').getPublicUrl(fileName);

      // Ajouter dans la DB
      const { error: dbError } = await supabase.from('rires').insert([{ name: file.name.replace(/\.(mp3|m4a)$/i, ''), url: publicUrl }]);
      if (dbError) console.error(dbError);
    }

    // Rafraîchir la liste
    fetchTracks();
  };

  const handleDragOver = (e) => e.preventDefault();

  const playTrack = (track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
    }
  };

  const deleteTrack = async (track) => {
    // Supprimer de Supabase Storage
    const path = track.url.split('/').pop();
    await supabase.storage.from('rires').remove([path]);

    // Supprimer de la DB
    await supabase.from('rires').delete().eq('id', track.id);

    // Mettre à jour la liste
    setTracks(tracks.filter(t => t.id !== track.id));
    if (currentTrack && currentTrack.id === track.id) {
      audioRef.current.pause();
      setCurrentTrack(null);
    }
  };

  const renameTrack = async (track) => {
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

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full max-w-xl h-32 border-4 border-dashed border-pink-600 rounded-xl flex items-center justify-center text-pink-800 font-semibold bg-white mb-6"
      >
        Glisse ici tes pistes MP3 ou M4A 🎵
      </div>

      <ul className="w-full max-w-xl space-y-2">
        {tracks.map((track) => (
          <li key={track.id} className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
            <span className="font-medium text-black">{track.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => playTrack(track)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                ▶ Écouter
              </button>
              <button
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
              </button>
            </div>
          </li>
        ))}
      </ul>

      <audio ref={audioRef} controls className="mt-6 w-full max-w-xl" />
    </main>
  );
}