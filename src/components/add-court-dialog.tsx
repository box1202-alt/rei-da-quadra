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
import { Shield, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Altere a senha de administrador aqui
const ADMIN_PASSWORD = '140193';

interface AddCourtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, modality: string) => void;
}

export function AddCourtDialog({ isOpen, onClose, onAdd }: AddCourtDialogProps) {
  const [step, setStep] = useState<'password' | 'form'>('password');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [modality, setModality] = useState('Futevôlei');
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setStep('form');
      setPassword('');
    } else {
      toast({
        title: "Senha Incorreta",
        description: "Você não tem permissão para adicionar quadras.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && modality) {
      onAdd(name, modality);
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setModality('Futevôlei');
    setStep('password');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogHeader>
                <DialogTitle className="text-orange-500 font-headline flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Modo Administrador
                </DialogTitle>
              </DialogHeader>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-pass">Senha Numérica</Label>
                <Input
                  id="admin-pass"
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
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full">Validar Acesso</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" /> Nova Quadra
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="court-name">Nome da Quadra / Arena</Label>
                <Input
                  id="court-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="Ex: Arena Principal"
                  required
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
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full">Criar Quadra</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}