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
import { Lock } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !user?.email || !auth.currentUser) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      setStep('change');
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: "Erro de Autenticação",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não Correspondem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha Fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({
        title: "Senha Alterada com Sucesso",
        description: "Sua nova senha foi definida.",
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Erro ao Alterar Senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('verify');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-headline uppercase italic flex items-center gap-2">
            <Lock className="w-5 h-5" /> {step === 'verify' ? 'VERIFICAR IDENTIDADE' : 'NOVA SENHA'}
          </DialogTitle>
        </DialogHeader>

        {step === 'verify' ? (
          <form onSubmit={handleVerifyPassword}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="current-password" className="uppercase font-bold">SENHA ATUAL</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white uppercase"
                  placeholder="DIGITE SUA SENHA ATUAL..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="uppercase font-black">CANCELAR</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic" disabled={loading}>
                {loading ? "VERIFICANDO..." : "CONTINUAR"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password" className="uppercase font-bold">NOVA SENHA</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="DIGITE SUA NOVA SENHA..."
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password" className="uppercase font-bold">CONFIRMAR NOVA SENHA</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                  placeholder="CONFIRME SUA NOVA SENHA..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="uppercase font-black">CANCELAR</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-black font-bold w-full uppercase italic" disabled={loading}>
                {loading ? "ALTERANDO..." : "ALTERAR SENHA"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
