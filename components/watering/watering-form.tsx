"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Droplets } from "lucide-react"
import Link from "next/link"
import type { Plant } from "@/lib/types"

interface WateringFormProps {
  plant: Plant
}

export function WateringForm({ plant }: WateringFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: plant.water_amount,
    notes: "",
    watered_at: new Date().toISOString().slice(0, 16), // Format for datetime-local input
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      // Record the watering
      const { error: wateringError } = await supabase.from("watering_history").insert([
        {
          plant_id: plant.id,
          user_id: user.id,
          amount: formData.amount,
          notes: formData.notes || null,
          watered_at: formData.watered_at,
        },
      ])

      if (wateringError) throw wateringError

      // The trigger will automatically update the plant's next_watering date
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-primary" />
            <CardTitle>Arroser {plant.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-4 bg-accent/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{plant.name}</span>
            <span className="text-sm text-muted-foreground">{plant.species}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Quantité habituelle:</span>
              <span className="ml-2 font-medium">{plant.water_amount} ml</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fréquence:</span>
              <span className="ml-2 font-medium">Tous les {plant.water_frequency} jours</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Quantité d'eau (ml) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number.parseInt(e.target.value) || plant.water_amount)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="watered_at">Date et heure *</Label>
              <Input
                id="watered_at"
                type="datetime-local"
                value={formData.watered_at}
                onChange={(e) => handleChange("watered_at", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ajoutez des observations sur l'état de la plante..."
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Droplets className="h-4 w-4 mr-2" />
              {isLoading ? "Enregistrement..." : "Enregistrer l'arrosage"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/dashboard">Annuler</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
