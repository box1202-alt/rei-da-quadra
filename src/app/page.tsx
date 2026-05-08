"use client";

import React, { useState } from 'react';
import { CrownBallIcon } from '@/components/crown-ball-icon';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ArrowRight, ShieldCheck, Settings } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { AdminDialog } from '@/components/admin-dialog';
import { CourtConfig } from '@/lib/types';

export default function PortalReiDaQuadra() {
  const db = useFirestore();
  const router = useRouter();
  const { data: courts, loading } = useCollection<CourtConfig>(
    db ? collection(db, 'courts') : null
  );
  
  const [adminDialogMode, setAdminDialogMode] = useState<'add' | 'edit' | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<CourtConfig | null>(null);

  const handleAddCourt = (name: string, modality: string) => {
    if (!db) return;
    const newCourt = {
      name: name.toUpperCase(),
      modality: modality.toUpperCase(),
      createdAt: serverTimestamp(),
      activeLeft: null,
      activeRight: null
    };
    addDoc(collection(db, 'courts'), newCourt)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'courts',
          operation: 'create',
          requestResourceData: newCourt
        }));
      });
  };

  const handleEditCourt = (name: string, modality: string) => {
    if (!db || !selectedCourt?.id) return;
    const courtRef = doc(db, 'courts', selectedCourt.id);
    const updatedData = {
      name: name.toUpperCase(),
      modality: modality.toUpperCase()
    };
    updateDoc(courtRef, updatedData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: courtRef.path,
          operation: 'update',
          requestResourceData: updatedData
        }));
      });
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
      {/* HEADER CENTRALIZADO COM LOGO E BRILHO */}
      <header className="w-full max-w-4xl flex flex-col items-center mb-16 mt-12">
        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-600 blur-[45px] opacity-30 rounded-full" />
            <CrownBallIcon className="w-28 h-28 text-orange-500 relative z-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]" />
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-orange-500 tracking-tighter italic uppercase leading-none">
              REI DA QUADRA
            </h1>
            <p className="text-zinc-500 text-[10px] md:text-xs tracking-[0.6em] font-black mt-4 uppercase">
              BEACH SPORTS PORTAL
            </p>
          </div>
        </div>
      </header>

      {/* SEÇÃO DE QUADRAS DISPONÍVEIS - DISPOSIÇÃO VERTICAL */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-8 px-2 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <LayoutGrid className="w-3 h-3 text-orange-500" /> QUADRAS DISPONÍVEIS
          </h2>
        </div>
        <Button 
          onClick={() => setAdminDialogMode('add')}
          variant="ghost"
          className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/5 font-black h-8 text-[10px] transition-all uppercase italic tracking-widest"
        >
          <Plus className="w-4 h-4 mr-1" /> NOVA QUADRA
        </Button>
      </div>

      {/* LISTA VERTICAL DE QUADRAS */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          ))
        ) : courts?.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-zinc-900 rounded-2xl">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-black uppercase italic tracking-widest opacity-50">NENHUMA QUADRA ATIVA.</p>
          </div>
        ) : (
          courts?.map((court) => (
            <div key={court.id} className="relative group">
              <Card 
                onClick={() => router.push(`/court/${court.id}`)}
                className="bg-zinc-950 border-zinc-900 p-6 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Badge className="bg-orange-500/10 text-orange-500 border-none font-black text-[9px] w-fit uppercase px-2 mb-2 tracking-widest">
                    {court.modality?.toUpperCase()}
                  </Badge>
                  <h3 className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors uppercase italic leading-tight">
                    {court.name?.toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">ARENA ATIVA</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                {/* MARCA D'ÁGUA NO CARD */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                  <CrownBallIcon className="w-32 h-32" />
                </div>
              </Card>

              {/* BOTÃO DE EDIÇÃO (ADMIN) */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourt(court);
                  setAdminDialogMode('edit');
                }}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-16 w-8 h-8 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-orange-500 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 pb-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-800 text-[9px] tracking-[0.5em] uppercase font-black">
          <ShieldCheck className="w-3 h-3" /> SISTEMA ADMINISTRATIVO
        </div>
        <div className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.2em] mt-2 opacity-50">
          Developed by: Leandro Borges
        </div>
      </footer>

      <AdminDialog 
        isOpen={adminDialogMode !== null}
        onClose={() => {
          setAdminDialogMode(null);
          setSelectedCourt(null);
        }}
        onSave={adminDialogMode === 'add' ? handleAddCourt : handleEditCourt}
        initialName={selectedCourt?.name}
        initialModality={selectedCourt?.modality}
        title={adminDialogMode === 'add' ? 'NOVA QUADRA' : 'EDITAR QUADRA'}
      />
    </main>
  );
}
