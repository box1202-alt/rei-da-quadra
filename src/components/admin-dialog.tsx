
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
import { useToast } from "@/hooks/use-toast";

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, modality: string) => void;
}

export function AdminDialog({ isOpen, onClose, onSave }: AdminDialogProps) {
  const [step, setStep] = useState<'password' | 'form'>('password');
  const [password, setPassword] = useState('');
  const [courtName, setCourtName] = useState('');
  const [modality, setModality] = useState('Futevôlei');
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') { // Pre-defined numeric password
      setStep('form');
    } else {
      toast({
        title: "Senha Incorreta",
        description: "A senha de administrador está errada.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleSave = () => {
    if (!courtName) return;
    onSave(courtName, modality);
    reset();
    onClose();
  };

  const reset = () => {
    setStep('password');
    setPassword('');
    setCourtName('');
    setModality('Futevôlei');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline">Acesso Administrador</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha Numérica</Label>
                <Input
                  id="password"
                  type="password"
                  inputMode="numeric"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Digite a senha..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold">Entrar</Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline">Configurar Quadra</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome da Quadra</Label>
                <Input
                  id="name"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Ex: Quadra Central"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Input
                  id="modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Ex: Futevôlei"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-black font-bold">Salvar Configurações</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
