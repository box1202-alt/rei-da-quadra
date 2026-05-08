
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddPairDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (p1: string, p2: string) => void;
}

export function AddPairDialog({ isOpen, onClose, onAdd }: AddPairDialogProps) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1 && p2) {
      onAdd(p1, p2);
      setP1('');
      setP2('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-headline flex items-center gap-2">
              <Plus className="w-5 h-5" /> Adicionar Dupla
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p1">Jogador 1</Label>
              <Input
                id="p1"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white"
                placeholder="Nome do primeiro jogador"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p2">Jogador 2</Label>
              <Input
                id="p2"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white"
                placeholder="Nome do segundo jogador"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full">Confirmar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
