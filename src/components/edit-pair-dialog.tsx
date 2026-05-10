"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface EditPairDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (p1: string, p2: string) => void
  onDelete: () => void
  initialPlayer1?: string
  initialPlayer2?: string
}

export function EditPairDialog({ isOpen, onClose, onSave, onDelete, initialPlayer1, initialPlayer2 }: EditPairDialogProps) {
  const [p1, setP1] = useState(initialPlayer1 || "")
  const [p2, setP2] = useState(initialPlayer2 || "")

  useEffect(() => {
    if (isOpen) {
      setP1(initialPlayer1 || "");
      setP2(initialPlayer2 || "");
    }
  }, [isOpen, initialPlayer1, initialPlayer2]);


  const handleSave = () => {
    if (p1.trim() && p2.trim()) {
      onSave(p1, p2)
      onClose()
    }
  }

  const handleDelete = () => {
    onDelete();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-orange-500 uppercase italic">EDITAR DUPLA</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="p1_edit" className="text-right text-zinc-400">
              Jogador 1
            </Label>
            <Input id="p1_edit" value={p1} onChange={(e) => setP1(e.target.value)} className="col-span-3 bg-zinc-900 border-zinc-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="p2_edit" className="text-right text-zinc-400">
              Jogador 2
            </Label>
            <Input id="p2_edit" value={p2} onChange={(e) => setP2(e.target.value)} className="col-span-3 bg-zinc-900 border-zinc-800" />
          </div>
        </div>
        <DialogFooter className="sm:justify-between mt-4">
            <Button type="button" variant="destructive" onClick={handleDelete}>
                Excluir Dupla
            </Button>
            <Button type="button" onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                Salvar Alterações
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}