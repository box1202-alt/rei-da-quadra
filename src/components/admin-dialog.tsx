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

// Altere a senha de administrador aqui
const ADMIN_PASSWORD = '1234';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (name: string, modality: string) => void;
  onReset?: () => void;
  initialName?: string;
  initialModality?: string;
  title: string;
  mode?: 'add' | 'edit' | 'reset';
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
  const [step, setStep] = useState<'password' | 'form'>(mode === 'reset' ? 'password' : 'form');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [courtName, setCourtName] = useState(initialName);
  const [modality, setModality] = useState(initialModality);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCourtName(initialName);
      setModality(initialModality);
      setPassword('');
      setAdminPassword('');
      setStep(mode === 'reset' ? 'password' : 'form');
    }
  }, [isOpen, initialName, initialModality, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'reset') {
      if (password !== ADMIN_PASSWORD) {
        toast({
          title: "SENHA INCORRETA",
          description: "A SENHA DE ADMINISTRADOR ESTÁ ERRADA.",
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

    if (adminPassword !== ADMIN_PASSWORD) {
      toast({
        title: "SENHA INCORRETA",
        description: "A SENHA DE ADMINISTRADOR ESTÁ ERRADA.",
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
                <ShieldCheck className="w-5 h-5" /> {mode === 'reset' ? 'RESET GERAL - CONFIRMAÇÃO' : `${title.toUpperCase()} - ADMIN`}
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