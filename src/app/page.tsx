
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
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col items-center mb-12">
        <div className="flex items-center gap-3 mb-2">
          <CrownBallIcon className="w-16 h-16 text-orange-500 drop-shadow-[0_0_15px_rgba(255,128,0,0.6)]" />
          <h1 className="text-5xl md:text-7xl font-black text-orange-500 tracking-tighter italic">REI DA QUADRA</h1>
        </div>
        <p className="text-white text-sm md:text-base tracking-[0.4em] font-light">PORTAL DE ARENA</p>
      </header>

      {/* Actions */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <LayoutGrid className="text-orange-500" /> Nossas Quadras
        </h2>
        <Button 
          onClick={() => setIsAddCourtOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-black font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(255,128,0,0.3)]"
        >
          <Plus className="w-5 h-5" /> Adicionar Quadra
        </Button>
      </div>

      {/* Court Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          ))
        ) : courts?.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-900 rounded-2xl">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-lg font-medium">Nenhuma quadra cadastrada.</p>
            <p className="text-sm">Clique em "Adicionar Quadra" para começar.</p>
          </div>
        ) : (
          courts?.map((court) => (
            <Link key={court.id} href={`/court/${court.id}`}>
              <Card className="group relative bg-zinc-950 border-zinc-800 p-6 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="w-6 h-6 text-orange-500" />
                </div>
                
                <div>
                  <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 mb-4">{court.modality}</Badge>
                  <h3 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors uppercase italic">{court.name}</h3>
                </div>

                <div className="mt-8 flex items-center justify-between text-zinc-500 text-xs font-bold tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    ATIVA
                  </div>
                  <span>VER FILA</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-20 pb-8 text-zinc-600 text-[10px] tracking-widest flex items-center gap-2 uppercase">
        <ShieldCheck className="w-3 h-3" /> Acesso restrito para administradores
      </footer>

      <AddCourtDialog 
        isOpen={isAddCourtOpen}
        onClose={() => setIsAddCourtOpen(false)}
        onAdd={handleAddCourt}
      />
    </main>
  );
}
