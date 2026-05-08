
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { AddPairDialog } from '@/components/add-pair-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, MoveRight, Layers, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { PlayerPair, CourtConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { doc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

export default function CourtDetails() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  
  const router = useRouter();
  const db = useFirestore();
  
  const courtRef = useMemo(() => (db && id ? doc(db, 'courts', id) : null), [db, id]);
  const queueRef = useMemo(() => (db && id ? collection(db, 'courts', id, 'queue') : null), [db, id]);
  const queueQuery = useMemo(() => (queueRef ? query(queueRef, orderBy('joinedAt', 'asc')) : null), [queueRef]);

  const { data: court, loading: loadingCourt } = useDoc<CourtConfig>(courtRef);
  const { data: waitingList, loading: loadingQueue } = useCollection<PlayerPair>(queueQuery);

  const [isAddPairOpen, setIsAddPairOpen] = useState(false);

  // Auto-preenchimento das quadras quando houver vaga
  useEffect(() => {
    if (!court || !waitingList || waitingList.length === 0 || !courtRef || !db || !id) return;

    const fillSide = async (side: 'activeLeft' | 'activeRight', pair: PlayerPair) => {
      const pairId = pair.id;
      if (!pairId) return;

      const updateData = { [side]: { ...pair, consecutiveWins: 0 } };
      
      updateDoc(courtRef, updateData)
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: courtRef.path,
            operation: 'update',
            requestResourceData: updateData
          }));
        });

      deleteDoc(doc(db, 'courts', id, 'queue', pairId));
    };

    if (!court.activeLeft) {
      fillSide('activeLeft', waitingList[0]);
    } else if (!court.activeRight) {
      fillSide('activeRight', waitingList[0]);
    }
  }, [court, waitingList, courtRef, db, id]);

  const handleWin = async (side: 'left' | 'right') => {
    if (!court || !courtRef || !db || !id) return;

    const winner = side === 'left' ? court.activeLeft : court.activeRight;
    const loser = side === 'left' ? court.activeRight : court.activeLeft;

    if (!winner || !loser) return;

    const newWins = (winner.consecutiveWins || 0) + 1;

    // REGRA DAS 2 VITÓRIAS CONSECUTIVAS
    if (newWins >= 2) {
      // 1. Ambas as duplas saem da quadra
      // 2. As duas próximas da fila entram
      const next1 = waitingList && waitingList.length > 0 ? waitingList[0] : null;
      const next2 = waitingList && waitingList.length > 1 ? waitingList[1] : null;

      // Cálculo para colocar o vencedor na Posição #1 (antes do atual primeiro da fila restante)
      let winnerTime = new Date();
      if (waitingList && waitingList.length > 2) {
        const thirdInLine = waitingList[2].joinedAt as Timestamp;
        if (thirdInLine) {
          // Define o tempo como 1 segundo antes do que será o novo #1
          winnerTime = new Date(thirdInLine.toMillis() - 1000); 
        }
      }

      const resetWinner = { 
        player1: winner.player1.toUpperCase(), 
        player2: winner.player2.toUpperCase(), 
        consecutiveWins: 0, 
        joinedAt: winnerTime 
      };
      
      const resetLoser = { 
        player1: loser.player1.toUpperCase(), 
        player2: loser.player2.toUpperCase(), 
        consecutiveWins: 0, 
        joinedAt: serverTimestamp() 
      };

      // Atualiza quadra com novos jogadores ou vazio
      updateDoc(courtRef, { 
        activeLeft: next1 ? { ...next1, consecutiveWins: 0 } : null, 
        activeRight: next2 ? { ...next2, consecutiveWins: 0 } : null 
      });

      // Remove da fila quem entrou
      if (next1?.id) deleteDoc(doc(db, 'courts', id, 'queue', next1.id));
      if (next2?.id) deleteDoc(doc(db, 'courts', id, 'queue', next2.id));

      // Re-insere as duplas que saíram na fila
      addDoc(collection(db, 'courts', id, 'queue'), resetWinner)
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `courts/${id}/queue`,
            operation: 'create',
            requestResourceData: resetWinner
          }));
        });

      addDoc(collection(db, 'courts', id, 'queue'), resetLoser)
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `courts/${id}/queue`,
            operation: 'create',
            requestResourceData: resetLoser
          }));
        });
    } else {
      // Regra normal: Vencedor fica, perdedor sai
      const resetLoser = { 
        player1: loser.player1.toUpperCase(), 
        player2: loser.player2.toUpperCase(), 
        consecutiveWins: 0, 
        joinedAt: serverTimestamp() 
      };
      
      addDoc(collection(db, 'courts', id, 'queue'), resetLoser)
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `courts/${id}/queue`,
            operation: 'create',
            requestResourceData: resetLoser
          }));
        });
      
      const updatedWinner = { ...winner, consecutiveWins: newWins };
      if (side === 'left') {
        updateDoc(courtRef, { activeLeft: updatedWinner, activeRight: null });
      } else {
        updateDoc(courtRef, { activeRight: updatedWinner, activeLeft: null });
      }
    }
  };

  const addPair = (p1: string, p2: string) => {
    if (!db || !id) return;
    const newPair = {
      player1: p1.toUpperCase(),
      player2: p2.toUpperCase(),
      consecutiveWins: 0,
      joinedAt: serverTimestamp()
    };
    addDoc(collection(db, 'courts', id, 'queue'), newPair)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `courts/${id}/queue`,
          operation: 'create',
          requestResourceData: newPair
        }));
      });
  };

  const handleDeletePair = async (pairId: string) => {
    if (!db || !id || !pairId) return;
    const pairRef = doc(db, 'courts', id, 'queue', pairId);
    deleteDoc(pairRef)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: pairRef.path,
          operation: 'delete'
        }));
      });
  };

  if (loadingCourt || !id) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-black mb-4 uppercase italic">QUADRA NÃO ENCONTRADA</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-orange-500 text-orange-500 uppercase font-black italic">VOLTAR AO PORTAL</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-5xl flex flex-col items-center mb-8 relative">
        <Button 
          variant="ghost" 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white font-black uppercase italic text-xs tracking-widest"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> <span className="hidden md:inline">PORTAL</span>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <CrownBallIcon className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl md:text-5xl font-black text-orange-500 tracking-tighter italic uppercase">REI DA QUADRA</h1>
        </div>
      </header>

      <div className="w-full max-w-5xl flex justify-between items-end mb-6">
        <div>
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[10px] mb-2 font-black tracking-widest">{court.modality?.toUpperCase()}</Badge>
          <h2 className="text-3xl font-black text-white italic uppercase leading-none">{court.name?.toUpperCase()}</h2>
        </div>
        <Button 
          onClick={() => setIsAddPairOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-black font-black uppercase italic text-xs py-5"
        >
          <Plus className="w-4 h-4 mr-2" /> ADICIONAR DUPLA
        </Button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <MoveRight className="w-3 h-3" /> EM QUADRA
            </h3>
          </div>
          
          <div className="relative aspect-[4/3] w-full bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl flex">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-10" />

            <div className="flex-1 flex flex-col items-center justify-center p-6 court-gradient relative">
              {court.activeLeft ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">{court.activeLeft.player1?.toUpperCase()}</div>
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">& {court.activeLeft.player2?.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-500 font-black text-[10px] uppercase">{court.activeLeft.consecutiveWins} {court.activeLeft.consecutiveWins === 1 ? 'VITÓRIA' : 'VITÓRIAS'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('left')} 
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase italic text-sm py-7 px-10 rounded-xl victory-button-press shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                  >
                    VITÓRIA
                  </Button>
                </div>
              ) : (
                <div className="text-zinc-900 font-black text-5xl opacity-40 select-none uppercase italic tracking-tighter">VAZIO</div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {court.activeRight ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">{court.activeRight.player1?.toUpperCase()}</div>
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic">& {court.activeRight.player2?.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-500 font-black text-[10px] uppercase">{court.activeRight.consecutiveWins} {court.activeRight.consecutiveWins === 1 ? 'VITÓRIA' : 'VITÓRIAS'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('right')} 
                    className="mt-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase italic text-sm py-7 px-10 rounded-xl victory-button-press shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                  >
                    VITÓRIA
                  </Button>
                </div>
              ) : (
                <div className="text-zinc-900 font-black text-5xl opacity-40 select-none uppercase italic tracking-tighter">VAZIO</div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <Layers className="w-3 h-3" /> PRÓXIMAS DUPLAS
            </h3>
            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 font-black uppercase text-[9px]">{waitingList?.length || 0} NA FILA</Badge>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden h-[500px] flex flex-col p-3 space-y-3 overflow-y-auto">
            {!waitingList || waitingList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 p-8 text-center">
                <Layers className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase italic tracking-widest opacity-30">NENHUMA DUPLA AGUARDANDO</p>
              </div>
            ) : (
              waitingList.map((pair, index) => (
                <Card key={pair.id} className="bg-zinc-900/50 border-zinc-800 p-4 hover:border-zinc-700 transition-colors group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-black font-black text-xs italic">{index + 1}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase italic">{pair.player1?.toUpperCase()} & {pair.player2?.toUpperCase()}</span>
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">LISTA DE ESPERA</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={() => handleDeletePair(pair.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="mt-auto pt-12 pb-8 flex flex-col items-center opacity-50">
        <div className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.2em]">
          Developed by: Leandro Borges
        </div>
      </footer>

      <AddPairDialog isOpen={isAddPairOpen} onClose={() => setIsAddPairOpen(false)} onAdd={addPair} />
    </main>
  );
}
