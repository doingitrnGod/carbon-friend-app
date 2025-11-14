import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    country: "India",
    household_size: 2,
    transport_type: "public",
    diet_type: "mixed",
    monthly_electricity: 200,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          country: data.country || "India",
          household_size: data.household_size || 2,
          transport_type: data.transport_type || "public",
          diet_type: data.diet_type || "mixed",
          monthly_electricity: data.monthly_electricity || 200,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          country: profile.country,
          household_size: profile.household_size,
          transport_type: profile.transport_type,
          diet_type: profile.diet_type,
          monthly_electricity: profile.monthly_electricity,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information to get more accurate carbon footprint calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="household">Household Size</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="household"
                  min={1}
                  max={10}
                  step={1}
                  value={[profile.household_size]}
                  onValueChange={(value) => setProfile({ ...profile, household_size: value[0] })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">{profile.household_size}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transport">Primary Transport</Label>
              <Select
                value={profile.transport_type}
                onValueChange={(value) => setProfile({ ...profile, transport_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">Walking</SelectItem>
                  <SelectItem value="bike">Bicycle</SelectItem>
                  <SelectItem value="public">Public Transport</SelectItem>
                  <SelectItem value="car">Personal Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet">Diet Type</Label>
              <Select
                value={profile.diet_type}
                onValueChange={(value) => setProfile({ ...profile, diet_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricity">Monthly Electricity Usage (kWh)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="electricity"
                  min={0}
                  max={1000}
                  step={50}
                  value={[profile.monthly_electricity]}
                  onValueChange={(value) => setProfile({ ...profile, monthly_electricity: value[0] })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-center">{profile.monthly_electricity} kWh</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
