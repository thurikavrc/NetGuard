import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderChartProps {
  title: string;
  icon: LucideIcon;
  variant?: "donut" | "bars";
  legend: { label: string; color: string; value?: string | number }[];
}

export function PlaceholderChart({ title, icon: Icon, variant = "donut", legend }: PlaceholderChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center">
            {variant === "donut" ? (
              <div
                className="relative h-40 w-40 rounded-full"
                style={{
                  background: `conic-gradient(${legend
                    .map((l, i) => {
                      const start = (i / legend.length) * 100;
                      const end = ((i + 1) / legend.length) * 100;
                      return `${l.color} ${start}% ${end}%`;
                    })
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-4 rounded-full bg-card" />
              </div>
            ) : (
              <div className="flex h-40 w-full items-end justify-around gap-3 px-2">
                {legend.map((l, i) => (
                  <div
                    key={i}
                    className="w-6 rounded-t"
                    style={{
                      height: `${30 + ((i * 37) % 60)}%`,
                      backgroundColor: l.color,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-sm">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.label}
                </span>
                {l.value !== undefined && (
                  <span className="font-medium text-foreground">{l.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          Preview · chart data coming soon
        </p>
      </CardContent>
    </Card>
  );
}