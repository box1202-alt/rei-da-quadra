"use client";

import React, { useEffect, useState } from 'react';
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
import { ShieldCheck, Copy, MessageSquare } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (name: string, modality: string) => void;
  onReset?: () => void;
  initialName?: string;
  initialModality?: string;
  title: string;
  mode?: 'add' | 'edit' | 'reset' | 'resetPlayers';
}

export function AdminDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  onReset,
  initialName = '', 
  initialModality = 'Futevôlei',
  title,
  mode = 'add'
}: AdminDialogProps) {
  const [step, setStep] = useState<'password' | 'form'>(mode === 'reset' || mode === 'resetPlayers' ? 'password' : 'form');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [courtName, setCourtName] = useState(initialName);
  const [modality, setModality] = useState(initialModality);
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  const verifyPassword = async (passwordToCheck: string) => {
    if (!auth || !user?.email || !auth.currentUser) {
      throw new Error('Usuário não autenticado.');
    }
    const credential = EmailAuthProvider.credential(user.email, passwordToCheck);
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  useEffect(() => {
    if (isOpen) {
      setCourtName(initialName);
      setModality(initialModality);
      setPassword('');
      setAdminPassword('');
      setStep(mode === 'reset' || mode === 'resetPlayers' ? 'password' : 'form');
    }
  }, [isOpen, initialName, initialModality, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'reset' || mode === 'resetPlayers') {
      try {
        await verifyPassword(password);
      } catch (error: any) {
        toast({
          title: "SENHA INCORRETA",
          description: "A SENHA de login está errada.",
          variant: "destructive",
        });
        setPassword('');
        return;
      }

      if (onReset) {
        onReset();
      }
      handleClose();
      return;
    }

    try {
      await verifyPassword(adminPassword);
    } catch (error: any) {
      toast({
        title: "SENHA INCORRETA",
        description: "A SENHA de login está errada.",
        variant: "destructive",
      });
      setAdminPassword('');
      return;
    }

    if (!courtName) return;
    if (onSave) {
      onSave(courtName, modality);
    }
    handleClose();
  };

  const reset = () => {
    setStep('password');
    setPassword('');
    setAdminPassword('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        {step === 'password' ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline uppercase italic flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> {mode === 'reset' ? 'RESET - CONFIRMAÇÃO' : mode === 'resetPlayers' ? 'RESET JOGADORES - CONFIRMAÇÃO' : `${title.toUpperCase()} - ADMIN`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="uppercase font-bold">SENHA NUMÉRICA</Label>
                <Input
                  id="password"
                  type="password"
                  inputMode="numeric"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white uppercase"
                  placeholder="DIGITE A SENHA..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="uppercase font-black">CANCELAR</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic">ENTRAR</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-orange-500 font-headline uppercase italic flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> CONFIGURAR QUADRA
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="uppercase font-bold">NOME DA QUADRA / ARENA</Label>
                <Input
                  id="name"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white uppercase"
                  placeholder="EX: ARENA PRINCIPAL"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="modality" className="uppercase font-bold">CATEGORIA / MODALIDADE</Label>
                <Input
                  id="modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white uppercase"
                  placeholder="EX: FUTEVÔLEI INICIANTE"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-password" className="uppercase font-bold">SENHA NUMÉRICA</Label>
                <Input
                  id="admin-password"
                  type="password"
                  inputMode="numeric"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white uppercase"
                  placeholder="DIGITE A SENHA..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic">
                SALVAR CONFIGURAÇÕES
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}