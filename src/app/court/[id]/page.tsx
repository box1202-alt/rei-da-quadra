
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
import { doc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

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
    if (!court || !waitingList || waitingList.length === 0 || !courtRef || !db) return;

    if (!court.activeLeft) {
      const next = waitingList[0];
      updateDoc(courtRef, { activeLeft: next });
      deleteDoc(doc(db, 'courts', id as string, 'queue', next.id));
    } else if (!court.activeRight) {
      const next = waitingList[0];
      updateDoc(courtRef, { activeRight: next });
      deleteDoc(doc(db, 'courts', id as string, 'queue', next.id));
    }
  }, [court, waitingList, courtRef, db, id]);

  const handleWin = async (side: 'left' | 'right') => {
    if (!court || !courtRef || !db) return;

    const winner = side === 'left' ? court.activeLeft : court.activeRight;
    const loser = side === 'left' ? court.activeRight : court.activeLeft;

    if (!winner || !loser) return;

    const newWins = (winner.consecutiveWins || 0) + 1;

    if (newWins >= 2) {
      // REGRA: 2 vitórias = AMBOS SAEM
      // Vencedor vai para o topo da lista de espera (Posição #1 após a entrada dos próximos)
      // Para ser o #1 da fila "restante", ele deve ficar logo após os 2 primeiros que vão entrar agora.
      
      let winnerTime;
      if (waitingList && waitingList.length >= 2) {
        // Se houver pelo menos 2 duplas na fila, elas vão entrar.
        // O vencedor deve ter um timestamp ligeiramente anterior à 3ª dupla (se existir) 
        // ou logo após a 2ª para ser o primeiro da nova fila.
        const refTime = waitingList[1].joinedAt as Timestamp;
        winnerTime = new Date(refTime.toMillis() + 10); // Logo após a 2ª dupla
      } else {
        // Se a fila estiver vazia ou com apenas 1, ele vai para o "fim" que acaba sendo o "topo"
        winnerTime = new Date();
      }

      const resetWinner = { 
        player1: winner.player1, 
        player2: winner.player2, 
        consecutiveWins: 0, 
        joinedAt: winnerTime 
      };
      
      const resetLoser = { 
        player1: loser.player1, 
        player2: loser.player2, 
        consecutiveWins: 0, 
        joinedAt: serverTimestamp() // Fim da fila
      };
      
      addDoc(collection(db, 'courts', id as string, 'queue'), resetWinner);
      addDoc(collection(db, 'courts', id as string, 'queue'), resetLoser);
      
      // Limpa a quadra para as duas novas duplas entrarem via useEffect
      updateDoc(courtRef, { activeLeft: null, activeRight: null });
    } else {
      // Vencedor fica (1ª vitória), perdedor vai para o fim da fila
      const resetLoser = { 
        player1: loser.player1, 
        player2: loser.player2, 
        consecutiveWins: 0, 
        joinedAt: serverTimestamp() 
      };
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
        <Button onClick={() => router.push('/')} variant="outline" className="border-orange-500 text-orange-500 uppercase font-black italic">Voltar ao Portal</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col items-center mb-8 relative">
        <Button 
          variant="ghost" 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white font-bold uppercase italic text-xs tracking-widest"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Portal</span>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <CrownBallIcon className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl md:text-5xl font-black text-orange-500 tracking-tighter italic uppercase">REI DA QUADRA</h1>
        </div>
      </header>

      {/* Main Info */}
      <div className="w-full max-w-5xl flex justify-between items-end mb-6">
        <div>
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[10px] mb-2 font-black">{court.modality}</Badge>
          <h2 className="text-3xl font-black text-white italic uppercase leading-none">{court.name}</h2>
        </div>
        <Button 
          onClick={() => setIsAddPairOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-black font-black uppercase italic text-xs py-5"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Dupla
        </Button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Display */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <MoveRight className="w-3 h-3" /> Em Quadra
            </h3>
          </div>
          
          <div className="relative aspect-[4/3] w-full bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl flex">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-10" />

            {/* Left Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 court-gradient relative">
              {court.activeLeft ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">{court.activeLeft.player1}</div>
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">& {court.activeLeft.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-500 font-black text-[10px] uppercase">{court.activeLeft.consecutiveWins} {court.activeLeft.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('left')} 
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase italic text-sm py-7 px-10 rounded-xl victory-button-press shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                  >
                    Vitória
                  </Button>
                </div>
              ) : (
                <div className="text-zinc-900 font-black text-5xl opacity-40 select-none uppercase italic tracking-tighter">Vazio</div>
              )}
            </div>

            {/* Right Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {court.activeRight ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">{court.activeRight.player1}</div>
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">& {court.activeRight.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-500 font-black text-[10px] uppercase">{court.activeRight.consecutiveWins} {court.activeRight.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('right')} 
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase italic text-sm py-7 px-10 rounded-xl victory-button-press shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                  >
                    Vitória
                  </Button>
                </div>
              ) : (
                <div className="text-zinc-900 font-black text-5xl opacity-40 select-none uppercase italic tracking-tighter">Vazio</div>
              )}
            </div>
          </div>
        </section>

        {/* Queue Display */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <Layers className="w-3 h-3" /> Próximas Duplas
            </h3>
            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 font-bold uppercase text-[9px]">{waitingList?.length || 0} na fila</Badge>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden h-[500px] flex flex-col p-3 space-y-3 overflow-y-auto">
            {!waitingList || waitingList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 p-8 text-center">
                <Layers className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase italic tracking-widest opacity-30">Nenhuma dupla aguardando</p>
              </div>
            ) : (
              waitingList.map((pair, index) => (
                <Card key={pair.id} className="bg-zinc-900/50 border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-black font-black text-xs italic">{index + 1}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase italic">{pair.player1} & {pair.player2}</span>
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Waiting List</span>
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
