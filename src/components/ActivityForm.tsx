import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.12, // per km
    car_diesel: 0.10,
    bike: 0.05,
    bus: 0.03,
    train: 0.02,
    flight: 0.25,
  },
  food: {
    beef: 27.0, // per meal
    chicken: 6.9,
    fish: 6.1,
    veg: 2.0,
    vegan: 1.5,
  },
  shopping: {
    clothing: 10.0, // per item
    electronics: 50.0,
    general: 5.0,
  },
  energy: {
    electricity: 0.5, // per kWh
    gas: 0.2,
  },
  waste: {
    general: 0.5, // per kg
  },
};

interface ActivityFormProps {
  onSuccess: () => void;
}

const ActivityForm = ({ onSuccess }: ActivityFormProps) => {
  const [activityType, setActivityType] = useState("transport");
  const [subType, setSubType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const getUnit = () => {
    switch (activityType) {
      case "transport":
        return "km";
      case "food":
        return "meals";
      case "shopping":
        return "items";
      case "energy":
        return "kWh";
      case "waste":
        return "kg";
      default:
        return "units";
    }
  };

  const calculateCO2 = () => {
    const qty = parseFloat(quantity);
    if (!qty || !subType) return 0;

    const factors = EMISSION_FACTORS[activityType as keyof typeof EMISSION_FACTORS];
    const factor = factors[subType as keyof typeof factors] || 0;
    return qty * factor;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const co2 = calculateCO2();
      
      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        activity_type: activityType,
        description: description || `${subType} - ${quantity} ${getUnit()}`,
        quantity: parseFloat(quantity),
        unit: getUnit(),
        co2_kg: co2,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to log activity");
    } finally {
      setLoading(false);
    }
  };

  const getSubTypeOptions = () => {
    switch (activityType) {
      case "transport":
        return [
          { value: "car_petrol", label: "Car (Petrol)" },
          { value: "car_diesel", label: "Car (Diesel)" },
          { value: "bike", label: "Motorcycle" },
          { value: "bus", label: "Bus" },
          { value: "train", label: "Train" },
          { value: "flight", label: "Flight" },
        ];
      case "food":
        return [
          { value: "beef", label: "Beef Meal" },
          { value: "chicken", label: "Chicken Meal" },
          { value: "fish", label: "Fish Meal" },
          { value: "veg", label: "Vegetarian" },
          { value: "vegan", label: "Vegan" },
        ];
      case "shopping":
        return [
          { value: "clothing", label: "Clothing" },
          { value: "electronics", label: "Electronics" },
          { value: "general", label: "General Items" },
        ];
      case "energy":
        return [
          { value: "electricity", label: "Electricity" },
          { value: "gas", label: "Natural Gas" },
        ];
      case "waste":
        return [{ value: "general", label: "General Waste" }];
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Activity Type</Label>
        <Select value={activityType} onValueChange={(value) => {
          setActivityType(value);
          setSubType("");
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transport">🚗 Transport</SelectItem>
            <SelectItem value="food">🍽️ Food</SelectItem>
            <SelectItem value="shopping">🛍️ Shopping</SelectItem>
            <SelectItem value="energy">⚡ Energy</SelectItem>
            <SelectItem value="waste">♻️ Waste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Specific Activity</Label>
        <Select value={subType} onValueChange={setSubType}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {getSubTypeOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Quantity ({getUnit()})</Label>
        <Input
          type="number"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={`Enter ${getUnit()}`}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any notes..."
        />
      </div>

      {quantity && subType && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium">Estimated CO₂ Impact:</p>
          <p className="text-2xl font-bold text-primary">{calculateCO2().toFixed(2)} kg</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading || !subType || !quantity}>
        {loading ? "Logging..." : "Log Activity"}
      </Button>
    </form>
  );
};

export default ActivityForm;
