"use client";

import React, { useState } from 'react';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ArrowRight, ShieldCheck } from 'lucide-react';
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
      {/* Header com Logomarca Atualizada e Brilho */}
      <header className="w-full max-w-4xl flex flex-col items-center mb-16 mt-12">
        <div className="flex flex-col items-center">
          {/* Logo com Brilho Intenso conforme imagem */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-600 blur-[45px] opacity-30 rounded-full" />
            <CrownBallIcon className="w-28 h-28 text-orange-500 relative z-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]" />
          </div>
          
          {/* Título Itálico e Subtítulo Espaçado */}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-orange-500 tracking-tighter italic uppercase leading-none">
              REI DA QUADRA
            </h1>
            <p className="text-zinc-500 text-[10px] md:text-xs tracking-[0.6em] font-bold mt-4 uppercase">
              BEACH SPORTS PORTAL
            </p>
          </div>
        </div>
      </header>

      {/* Seção de Quadras */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-8 px-2 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <LayoutGrid className="w-3 h-3 text-orange-500" /> Quadras Disponíveis
          </h2>
        </div>
        <Button 
          onClick={() => setIsAddCourtOpen(true)}
          variant="ghost"
          className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/5 font-bold h-8 text-[10px] transition-all uppercase italic tracking-widest"
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Quadra
        </Button>
      </div>

      {/* Lista de Quadras Vertical */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          ))
        ) : courts?.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-zinc-900 rounded-2xl">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium uppercase italic tracking-widest opacity-50">Nenhuma quadra ativa.</p>
          </div>
        ) : (
          courts?.map((court) => (
            <Link key={court.id} href={`/court/${court.id}`} className="block">
              <Card className="group relative bg-zinc-950 border-zinc-900 p-6 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Badge className="bg-orange-500/10 text-orange-500 border-none font-black text-[9px] w-fit uppercase px-2 mb-2">
                    {court.modality}
                  </Badge>
                  <h3 className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors uppercase italic leading-tight">
                    {court.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Live Arena</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Efeito Visual de Fundo com a nova Logomarca */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                  <CrownBallIcon className="w-32 h-32" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      <footer className="mt-20 pb-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-800 text-[9px] tracking-[0.5em] uppercase font-bold">
          <ShieldCheck className="w-3 h-3" /> System Admin
        </div>
      </footer>

      <AddCourtDialog 
        isOpen={isAddCourtOpen}
        onClose={() => setIsAddCourtOpen(false)}
        onAdd={handleAddCourt}
      />
    </main>
  );
}
