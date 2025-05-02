import { Button } from "@/components/ui/button";

export type BillingInterval = "monthly" | "annual";

interface PlanSelectorProps {
  interval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}

export function PlanSelector({
  interval,
  onIntervalChange,
}: PlanSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <Button
        variant={interval === "monthly" ? "default" : "ghost"}
        onClick={() => onIntervalChange("monthly")}
      >
        Monthly
      </Button>
      <Button
        variant={interval === "annual" ? "default" : "ghost"}
        onClick={() => onIntervalChange("annual")}
      >
        Annual
      </Button>
    </div>
  );
}
