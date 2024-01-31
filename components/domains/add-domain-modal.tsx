import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/context/team-context";
import { useState } from "react";
import { toast } from "sonner";
import { UpgradePlanModal } from "../billing/upgrade-plan-modal";
import { usePlan } from "@/lib/swr/use-billing";

export function AddDomainModal({
  open,
  setOpen,
  onAddition,
  children,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAddition?: (newDomain: string) => void;
  children?: React.ReactNode;
}) {
  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const teamInfo = useTeam();
  const { plan } = usePlan();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (domain == "") return;

    setLoading(true);
    const response = await fetch(
      `/api/teams/${teamInfo?.currentTeam?.id}/domains`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domain,
        }),
      },
    );

    if (!response.ok) {
      const { message } = await response.json();
      setLoading(false);
      setOpen(false);
      toast.error(message);
      return;
    }

    const newDomain = await response.json();

    toast.success("Domain added successfully! 🎉");

    // Update local data with the new link
    onAddition && onAddition(newDomain);

    setOpen(false);

    setLoading(false);

    !onAddition && window.open("/settings/domains", "_blank");
  };

  // If the team is on a free plan, show the upgrade modal
  if (plan && plan.plan === "free") {
    if (children) {
      return (
        <UpgradePlanModal clickedPlan="Pro">
          <Button>Upgrade to Add Domain</Button>
        </UpgradePlanModal>
      );
    } else {
      return (
        <UpgradePlanModal clickedPlan="Pro" open={open} setOpen={setOpen} />
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            You can easily add a custom domain.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right">
                Domain
              </Label>
              <Input
                id="domain"
                placeholder="docs.yourdomain.com"
                className="col-span-3"
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add domain</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
