"use client";

import React, { useState } from 'react';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AddCourtDialog } from '@/components/add-court-dialog';
import { CourtConfig } from '@/lib/types';

export default function PortalReiDaQuadra() {
  const db = useFirestore();
  const { data: courts, loading } = useCollection<CourtConfig>(
    db ? collection(db, 'courts') : null
  );
  
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);

  const handleAddCourt = (name: string, modality: string) => {
    if (!db) return;
    addDoc(collection(db, 'courts'), {
      name,
      modality,
      createdAt: serverTimestamp(),
      activeLeft: null,
      activeRight: null
    });
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      {/* Header Estilizado */}
      <header className="w-full max-w-3xl flex flex-col items-center mb-16 mt-8">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse" />
            <CrownBallIcon className="w-24 h-24 text-orange-500 drop-shadow-[0_0_20px_rgba(255,128,0,0.8)] relative z-10" />
          </div>
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black text-orange-500 tracking-tighter italic uppercase leading-none">
              REI DA <br className="md:hidden" /> QUADRA
            </h1>
            <p className="text-white text-[10px] md:text-xs tracking-[0.8em] font-light mt-4 opacity-70 uppercase pl-2">
              PORTAL DE ARENA • PREMIUM SYSTEM
            </p>
          </div>
        </div>
      </header>

      {/* Seção de Título e Ação */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-8 px-2 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-orange-500" /> Arenas Disponíveis
          </h2>
        </div>
        <Button 
          onClick={() => setIsAddCourtOpen(true)}
          variant="outline"
          className="border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-black font-bold h-8 text-xs transition-all uppercase italic"
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Arena
        </Button>
      </div>

      {/* Lista de Quadras Vertical */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          ))
        ) : courts?.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-700 border-2 border-dashed border-zinc-900 rounded-2xl">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-lg font-medium uppercase italic tracking-tighter">Nenhuma arena ativa.</p>
          </div>
        ) : (
          courts?.map((court) => (
            <Link key={court.id} href={`/court/${court.id}`} className="block">
              <Card className="group relative bg-zinc-950 border-zinc-900 p-6 hover:border-orange-500 transition-all cursor-pointer overflow-hidden flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Badge className="bg-orange-500 text-black border-none font-black text-[9px] w-fit uppercase px-2 mb-2">
                    {court.modality}
                  </Badge>
                  <h3 className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors uppercase italic leading-tight">
                    {court.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Em tempo real</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase">Entrar na</span>
                    <span className="text-sm font-black text-white uppercase italic">Arena</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
                
                {/* Efeito Visual de Fundo */}
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <CrownBallIcon className="w-32 h-32" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 pb-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-700 text-[10px] tracking-[0.4em] uppercase font-bold">
          <ShieldCheck className="w-3 h-3" /> Acesso Administrativo
        </div>
        <div className="w-1 h-8 bg-gradient-to-b from-orange-500/50 to-transparent" />
      </footer>

      <AddCourtDialog 
        isOpen={isAddCourtOpen}
        onClose={() => setIsAddCourtOpen(false)}
        onAdd={handleAddCourt}
      />
    </main>
  );
}
