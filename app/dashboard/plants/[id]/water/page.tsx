import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WateringForm } from "@/components/watering/watering-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function WaterPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch the plant
  const { data: plant } = await supabase.from("plants").select("*").eq("id", id).eq("user_id", data.user.id).single()

  if (!plant) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <WateringForm plant={plant} />
        </div>
      </main>
    </div>
  )
}
