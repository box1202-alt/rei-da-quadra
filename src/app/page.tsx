
"use client";

import React, { useState, useEffect } from 'react';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { AdminDialog } from '@/components/admin-dialog';
import { AddPairDialog } from '@/components/add-pair-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trophy, Users, MoveRight, Layers } from 'lucide-react';
import { PlayerPair, CourtConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function ReiDaQuadra() {
  const [court, setCourt] = useState<CourtConfig>({ name: 'Arena Principal', modality: 'Futevôlei' });
  const [waitingList, setWaitingList] = useState<PlayerPair[]>([]);
  const [leftPair, setLeftPair] = useState<PlayerPair | null>(null);
  const [rightPair, setRightPair] = useState<PlayerPair | null>(null);
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddPairOpen, setIsAddPairOpen] = useState(false);

  // Re-fill court from queue if empty
  useEffect(() => {
    if (!leftPair && waitingList.length > 0) {
      const next = waitingList[0];
      setLeftPair(next);
      setWaitingList(prev => prev.slice(1));
    }
    if (!rightPair && waitingList.length > 0) {
      // If we still have teams and right is empty
      const next = waitingList[0];
      setRightPair(next);
      setWaitingList(prev => prev.slice(1));
    }
  }, [leftPair, rightPair, waitingList]);

  const handleWin = (side: 'left' | 'right') => {
    const winner = side === 'left' ? leftPair : rightPair;
    const loser = side === 'left' ? rightPair : leftPair;

    if (!winner || !loser) return;

    const newWins = winner.consecutiveWins + 1;
    const updatedWinner = { ...winner, consecutiveWins: newWins };

    if (newWins === 2) {
      // 2 wins rule: Both teams leave.
      // Winner goes to position #1 of queue
      // Loser goes to end of queue
      const resetWinner = { ...updatedWinner, consecutiveWins: 0 };
      const resetLoser = { ...loser, consecutiveWins: 0 };
      
      setWaitingList(prev => [resetWinner, ...prev, resetLoser]);
      setLeftPair(null);
      setRightPair(null);
    } else {
      // Winner stays, Loser goes to end of queue
      const resetLoser = { ...loser, consecutiveWins: 0 };
      setWaitingList(prev => [...prev, resetLoser]);
      
      if (side === 'left') {
        setLeftPair(updatedWinner);
        setRightPair(null);
      } else {
        setRightPair(updatedWinner);
        setLeftPair(null);
      }
    }
  };

  const addPair = (p1: string, p2: string) => {
    const newPair: PlayerPair = {
      id: Math.random().toString(36).substr(2, 9),
      player1: p1,
      player2: p2,
      consecutiveWins: 0
    };
    setWaitingList(prev => [...prev, newPair]);
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CrownBallIcon className="w-12 h-12 text-orange-500 drop-shadow-[0_0_10px_rgba(255,128,0,0.5)]" />
          <h1 className="text-4xl md:text-6xl font-black text-orange-500 tracking-tighter italic">REI DA QUADRA</h1>
        </div>
        <p className="text-white text-sm md:text-base tracking-[0.3em] font-light">BEACH SPORTS PORTAL</p>
      </header>

      {/* Main Actions Row */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {court.name}
            <Badge variant="outline" className="border-orange-500/50 text-orange-500 uppercase text-[10px]">{court.modality}</Badge>
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAdminOpen(true)}
            variant="outline" 
            size="icon"
            className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => setIsAddPairOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-black font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(255,128,0,0.3)]"
          >
            <Plus className="w-5 h-5" /> <span className="hidden md:inline">Adicionar Dupla</span>
          </Button>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Display (Vertical Split) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <MoveRight className="w-4 h-4" /> Em Quadra
            </h3>
            { (leftPair || rightPair) && (
               <span className="text-xs text-zinc-500 animate-pulse font-medium">JOGO EM ANDAMENTO</span>
            )}
          </div>
          
          <div className="relative aspect-[4/3] w-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex">
            {/* Visual Net (Vertical) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10">
              <div className="absolute top-0 bottom-0 left-[-4px] right-[-4px] border-x border-white/5 border-dashed" />
              <div className="absolute top-1/2 left-[-10px] transform -translate-y-1/2 rotate-90 text-[10px] text-white/30 font-bold tracking-widest">REDE</div>
            </div>

            {/* Left Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 court-gradient relative">
              {leftPair ? (
                <div className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-white">{leftPair.player1}</div>
                    <div className="text-2xl font-black text-white">& {leftPair.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold text-sm">{leftPair.consecutiveWins} {leftPair.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('left')}
                    className="mt-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs py-6 px-8 rounded-xl victory-button-press shadow-lg"
                  >
                    Vitoria
                  </Button>
                </div>
              ) : (
                <div className="text-zinc-700 font-black text-4xl opacity-20 select-none">DUPLA 1</div>
              )}
            </div>

            {/* Right Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {rightPair ? (
                <div className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-white">{rightPair.player1}</div>
                    <div className="text-2xl font-black text-white">& {rightPair.player2}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500 font-bold text-sm">{rightPair.consecutiveWins} {rightPair.consecutiveWins === 1 ? 'Vitória' : 'Vitórias'}</span>
                  </div>
                  <Button 
                    onClick={() => handleWin('right')}
                    className="mt-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs py-6 px-8 rounded-xl victory-button-press shadow-lg"
                  >
                    Vitoria
                  </Button>
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
            <Badge className="bg-zinc-800 text-zinc-400">{waitingList.length} em espera</Badge>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden h-[500px] flex flex-col">
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {waitingList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
                  <Users className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm font-medium opacity-50 uppercase tracking-tighter">Nenhuma dupla na fila. Clique no "+" para adicionar.</p>
                </div>
              ) : (
                waitingList.map((pair, index) => (
                  <Card key={pair.id} className="bg-zinc-900 border-zinc-800 p-4 hover:border-orange-500/30 transition-all animate-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-black font-black text-sm">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{pair.player1} & {pair.player2}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Aguardando...</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-orange-500/20 text-orange-500 border-none text-[9px] uppercase font-black">Próximo</Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 w-full max-w-5xl border-t border-zinc-900 pt-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-[10px] gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Regra: 2 Vitórias consecutivas sai</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>Perdedor vai para o fim da fila</span>
          </div>
        </div>
        <p className="font-medium tracking-tighter">© 2024 REI DA QUADRA - BEACH SPORTS PORTAL</p>
      </footer>

      {/* Modals */}
      <AdminDialog 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onSave={(name, modality) => setCourt({ name, modality })} 
      />
      <AddPairDialog 
        isOpen={isAddPairOpen} 
        onClose={() => setIsAddPairOpen(false)} 
        onAdd={addPair} 
      />
    </main>
  );
}
