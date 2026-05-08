
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

// Altere a senha de administrador aqui
const ADMIN_PASSWORD = '1234';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, modality: string) => void;
  initialName?: string;
  initialModality?: string;
  title: string;
}

export function AdminDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  initialName = '', 
  initialModality = 'Futevôlei',
  title
}: AdminDialogProps) {
  const [step, setStep] = useState<'password' | 'form'>('password');
  const [password, setPassword] = useState('');
  const [courtName, setCourtName] = useState(initialName);
  const [modality, setModality] = useState(initialModality);
  const { toast } = useToast();

  // Update internal state when props change (for editing different courts)
  React.useEffect(() => {
    if (isOpen) {
      setCourtName(initialName);
      setModality(initialModality);
    }
  }, [isOpen, initialName, initialModality]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setStep('form');
      setPassword('');
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
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline uppercase italic">{title} - Admin</DialogTitle>
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
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic">Entrar</Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline uppercase italic">Configurar Quadra</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome da Quadra / Arena</Label>
                <Input
                  id="name"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Ex: Arena Principal"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="modality">Categoria / Modalidade</Label>
                <Input
                  id="modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Ex: Futevôlei Iniciante"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic">Salvar Configurações</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
