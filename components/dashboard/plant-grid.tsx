import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Droplets, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import type { Plant } from "@/lib/types"

interface PlantGridProps {
  plants: Plant[]
}

export function PlantGrid({ plants }: PlantGridProps) {
  if (plants.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Droplets className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune plante pour le moment</h3>
          <p className="text-muted-foreground mb-4">Commencez votre collection en ajoutant votre première plante</p>
          <Button asChild>
            <Link href="/dashboard/plants/new">Ajouter une plante</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    })
  }

  const isOverdue = (nextWatering: string | null) => {
    if (!nextWatering) return false
    return new Date(nextWatering) <= new Date()
  }

  const getDaysUntilWatering = (nextWatering: string | null) => {
    if (!nextWatering) return null
    const days = Math.ceil((new Date(nextWatering).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes plantes</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/plants/new">Ajouter une plante</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plants.map((plant) => {
          const daysUntilWatering = getDaysUntilWatering(plant.next_watering)
          const needsWater = isOverdue(plant.next_watering)

          return (
            <Card key={plant.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plant.species}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/plants/${plant.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plant.image_url && (
                  <div className="aspect-video rounded-lg bg-muted overflow-hidden">
                    <img
                      src={plant.image_url || "/placeholder.svg"}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prochain arrosage</span>
                    {plant.next_watering ? (
                      <div className="flex items-center space-x-2">
                        {needsWater ? (
                          <Badge variant="destructive" className="text-xs">
                            À arroser maintenant
                          </Badge>
                        ) : daysUntilWatering !== null ? (
                          <Badge variant="secondary" className="text-xs">
                            Dans {daysUntilWatering} jour{daysUntilWatering > 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non planifié</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fréquence</span>
                    <span>Tous les {plant.water_frequency} jours</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantité</span>
                    <span>{plant.water_amount} ml</span>
                  </div>

                  {plant.last_watered && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dernier arrosage</span>
                      <span>{formatDate(plant.last_watered)}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/dashboard/plants/${plant.id}/water`}>
                      <Droplets className="h-4 w-4 mr-2" />
                      Arroser
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/plants/${plant.id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Détails
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
