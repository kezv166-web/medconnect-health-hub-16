import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplet, Bed, Activity, Save, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const ResourceControlCenter = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState({
    oxygenCylinders: 15,
    totalOxygen: 20,
    icuBeds: 3,
    totalICU: 12,
    bloodBank: {
      "A+": 12,
      "A-": 5,
      "B+": 8,
      "B-": 3,
      "O+": 15,
      "O-": 7,
      "AB+": 4,
      "AB-": 2,
    },
  });

  const handleResourceChange = (field: string, value: number) => {
    setResources((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  const handleBloodChange = (type: string, value: number) => {
    setResources((prev) => ({
      ...prev,
      bloodBank: {
        ...prev.bloodBank,
        [type]: Math.max(0, value),
      },
    }));
  };

  const handleSave = () => {
    toast({
      title: "Resources Updated",
      description: "Hospital resource availability has been updated successfully",
    });
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return "text-destructive";
    if (percentage < 30) return "text-destructive";
    if (percentage < 60) return "text-yellow-600";
    return "text-success";
  };

  return (
    <div className="space-y-6">
      {/* Critical Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Oxygen Cylinders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Droplet className="w-5 h-5 text-primary" />
              </div>
              Oxygen Cylinders
            </CardTitle>
            <CardDescription>Manage oxygen supply availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <p
                  className={`text-2xl font-bold ${getAvailabilityColor(
                    resources.oxygenCylinders,
                    resources.totalOxygen
                  )}`}
                >
                  {resources.oxygenCylinders} / {resources.totalOxygen}
                </p>
              </div>
              <Badge
                variant={resources.oxygenCylinders > 10 ? "default" : "destructive"}
                className="text-sm"
              >
                {Math.round((resources.oxygenCylinders / resources.totalOxygen) * 100)}% Available
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Available Cylinders</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleResourceChange("oxygenCylinders", resources.oxygenCylinders - 1)
                  }
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={resources.oxygenCylinders}
                  onChange={(e) =>
                    handleResourceChange("oxygenCylinders", parseInt(e.target.value) || 0)
                  }
                  className="text-center font-semibold"
                  max={resources.totalOxygen}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleResourceChange("oxygenCylinders", resources.oxygenCylinders + 1)
                  }
                  disabled={resources.oxygenCylinders >= resources.totalOxygen}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Capacity</Label>
              <Input
                type="number"
                value={resources.totalOxygen}
                onChange={(e) => handleResourceChange("totalOxygen", parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ICU Beds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <Bed className="w-5 h-5 text-success" />
              </div>
              ICU Beds
            </CardTitle>
            <CardDescription>Manage intensive care unit capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <p
                  className={`text-2xl font-bold ${getAvailabilityColor(
                    resources.icuBeds,
                    resources.totalICU
                  )}`}
                >
                  {resources.icuBeds} / {resources.totalICU}
                </p>
              </div>
              <Badge
                variant={resources.icuBeds > 2 ? "default" : "destructive"}
                className="text-sm"
              >
                {Math.round((resources.icuBeds / resources.totalICU) * 100)}% Available
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Available Beds</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleResourceChange("icuBeds", resources.icuBeds - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={resources.icuBeds}
                  onChange={(e) => handleResourceChange("icuBeds", parseInt(e.target.value) || 0)}
                  className="text-center font-semibold"
                  max={resources.totalICU}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleResourceChange("icuBeds", resources.icuBeds + 1)}
                  disabled={resources.icuBeds >= resources.totalICU}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Capacity</Label>
              <Input
                type="number"
                value={resources.totalICU}
                onChange={(e) => handleResourceChange("totalICU", parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Bank */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Activity className="w-5 h-5 text-destructive" />
            </div>
            Blood Bank Inventory
          </CardTitle>
          <CardDescription>Manage blood units by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodTypes.map((type) => (
              <div key={type} className="space-y-2">
                <Label className="text-center block">{type}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleBloodChange(type, resources.bloodBank[type] - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={resources.bloodBank[type]}
                    onChange={(e) => handleBloodChange(type, parseInt(e.target.value) || 0)}
                    className="text-center font-semibold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleBloodChange(type, resources.bloodBank[type] + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {resources.bloodBank[type]} units
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="min-w-[200px]">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default ResourceControlCenter;
