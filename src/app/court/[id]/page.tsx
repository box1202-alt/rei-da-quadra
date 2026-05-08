
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { AddPairDialog } from '@/components/add-pair-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, MoveRight, Layers, ArrowLeft, Loader2 } from 'lucide-react';
import { PlayerPair, CourtConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function CourtDetails() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const courtRef = db ? doc(db, 'courts', id as string) : null;
  const { data: court, loading: loadingCourt } = useDoc<CourtConfig>(courtRef);
  
  const queueRef = db ? collection(db, 'courts', id as string, 'queue') : null;
  const { data: waitingList } = useCollection<PlayerPair>(
    queueRef ? query(queueRef, orderBy('joinedAt', 'asc')) : null
  );

  const [isAddPairOpen, setIsAddPairOpen] = useState(false);

  // Logic to fill court from queue automatically if slots are empty
  useEffect(() => {
    if (!court || !waitingList || waitingList.length === 0 || !courtRef) return;

    if (!court.activeLeft) {
      const next = waitingList[0];
      updateDoc(courtRef, { activeLeft: next });
      deleteDoc(doc(db!, 'courts', id as string, 'queue', next.id));
    } else if (!court.activeRight) {
      const next = waitingList[0];
      updateDoc(courtRef, { activeRight: next });
      deleteDoc(doc(db!, 'courts', id as string, 'queue', next.id));
    }
  }, [court, waitingList, courtRef, db, id]);

  const handleWin = async (side: 'left' | 'right') => {
    if (!court || !courtRef || !db) return;

    const winner = side === 'left' ? court.activeLeft : court.activeRight;
    const loser = side === 'left' ? court.activeRight : court.activeLeft;

    if (!winner || !loser) return;

    const newWins = (winner.consecutiveWins || 0) + 1;

    if (newWins === 2) {
      // Rule: 2 wins = both leave
      const resetWinner = { ...winner, consecutiveWins: 0, joinedAt: serverTimestamp() };
      const resetLoser = { ...loser, consecutiveWins: 0, joinedAt: serverTimestamp() };
      
      // Winner goes to position #1 (we'll simulate this by adding with older timestamp if needed, 
      // but simple end of queue for now as per previous logic)
      addDoc(collection(db, 'courts', id as string, 'queue'), resetWinner);
      addDoc(collection(db, 'courts', id as string, 'queue'), resetLoser);
      
      updateDoc(courtRef, { activeLeft: null, activeRight: null });
    } else {
      // Winner stays, loser to end of queue
      const resetLoser = { ...loser, consecutiveWins: 0, joinedAt: serverTimestamp() };
      addDoc(collection(db, 'courts', id as string, 'queue'), resetLoser);
      
      const updatedWinner = { ...winner, consecutiveWins: newWins };
      if (side === 'left') {
        updateDoc(courtRef, { activeLeft: updatedWinner, activeRight: null });
      } else {
        updateDoc(courtRef, { activeRight: updatedWinner, activeLeft: null });
      }
    }
  };

  const addPair = (p1: string, p2: string) => {
    if (!db) return;
    addDoc(collection(db, 'courts', id as string, 'queue'), {
      player1: p1,
      player2: p2,
      consecutiveWins: 0,
      joinedAt: serverTimestamp()
    });
  };

  if (loadingCourt) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Quadra não encontrada</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-orange-500 text-orange-500">Voltar ao Portal</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col items-center mb-8 relative">
        <Button 
          variant="ghost" 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> <span className="hidden md:inline">Portal</span>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <CrownBallIcon className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl md:text-5xl font-black text-orange-500 tracking-tighter italic uppercase">REI DA QUADRA</h1>
        </div>
      </header>

      {/* Main Info */}
      <div className="w-full max-w-5xl flex justify-between items-end mb-6">
        <div>
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[10px] mb-2">{court.modality}</Badge>
          <h2 className="text-3xl font-black text-white italic uppercase">{court.name}</h2>
        </div>
        <Button 
          onClick={() => setIsAddPairOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-black font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> <span className="hidden md:inline">Adicionar Dupla</span>
        </Button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Display */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <MoveRight className="w-4 h-4" /> Em Quadra
            </h3>
          </div>
          
          <div className="relative aspect-[4/3] w-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />

            {/* Left Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 court-gradient relative">
              {court.activeLeft ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-white">{court.activeLeft.player1}</div>
                    <div className="text-2xl font-black text-white">& {court.activeLeft.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold text-sm">{court.activeLeft.consecutiveWins} {court.activeLeft.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button onClick={() => handleWin('left')} className="mt-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs py-6 px-8 rounded-xl victory-button-press">Vitoria</Button>
                </div>
              ) : (
                <div className="text-zinc-700 font-black text-4xl opacity-20 select-none">DUPLA 1</div>
              )}
            </div>

            {/* Right Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {court.activeRight ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-white">{court.activeRight.player1}</div>
                    <div className="text-2xl font-black text-white">& {court.activeRight.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold text-sm">{court.activeRight.consecutiveWins} {court.activeRight.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button onClick={() => handleWin('right')} className="mt-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs py-6 px-8 rounded-xl victory-button-press">Vitoria</Button>
                </div>
              ) : (
                <div className="text-zinc-700 font-black text-4xl opacity-20 select-none">DUPLA 2</div>
              )}
            </div>
          </div>
        </section>

        {/* Queue Display */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" /> Próximas Duplas
            </h3>
            <Badge className="bg-zinc-800 text-zinc-400">{waitingList?.length || 0} em espera</Badge>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden h-[500px] flex flex-col p-2 space-y-2 overflow-y-auto">
            {!waitingList || waitingList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
                <p className="text-sm font-medium opacity-50 uppercase tracking-tighter">Nenhuma dupla na fila.</p>
              </div>
            ) : (
              waitingList.map((pair, index) => (
                <Card key={pair.id} className="bg-zinc-900 border-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-black font-black text-sm">{index + 1}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{pair.player1} & {pair.player2}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">Aguardando...</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      <AddPairDialog isOpen={isAddPairOpen} onClose={() => setIsAddPairOpen(false)} onAdd={addPair} />
    </main>
  );
}
