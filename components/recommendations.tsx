import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function Recommendations() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-foreground">Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          Basado en el análisis, se recomienda enfocar la estrategia de contenido en los temas de{" "}
          <span className="font-medium text-accent">&apos;innovación&apos;</span> y{" "}
          <span className="font-medium text-accent">&apos;soporte al cliente&apos;</span> para mejorar la
          percepción del LLM. Considere aumentar la visibilidad en plataformas de reviews y
          fortalecer el posicionamiento en blogs de la industria.
        </p>
      </CardContent>
    </Card>
  )
}
