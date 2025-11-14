import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingDown, Target, Award, Plus, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import EmissionsChart from "@/components/EmissionsChart";
import ActivityForm from "@/components/ActivityForm";
import ChallengesList from "@/components/ChallengesList";

interface Profile {
  name: string;
  diet_type: string;
  transport_type: string;
  monthly_electricity: number;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  co2_kg: number;
  date: string;
}

interface Goal {
  target_co2_reduction: number;
  current_reduction: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [totalCO2, setTotalCO2] = useState(0);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(10);

      setActivities(activitiesData || []);
      
      const total = (activitiesData || []).reduce((sum, activity) => sum + Number(activity.co2_kg), 0);
      setTotalCO2(total);

      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      setGoal(goalData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleActivityAdded = () => {
    setShowActivityForm(false);
    loadData();
    toast.success("Activity logged successfully!");
  };

  const categoryData = activities.reduce((acc, activity) => {
    const existing = acc.find(item => item.name === activity.activity_type);
    if (existing) {
      existing.value += Number(activity.co2_kg);
    } else {
      acc.push({ name: activity.activity_type, value: Number(activity.co2_kg) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EcoTrack</h1>
              <p className="text-xs text-muted-foreground">Track your carbon footprint</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CO₂ This Month</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCO2.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">Carbon footprint tracked</p>
            </CardContent>
          </Card>

          {goal && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {goal.target_co2_reduction - goal.current_reduction} kg
                </div>
                <Progress 
                  value={(goal.current_reduction / goal.target_co2_reduction) * 100} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((goal.current_reduction / goal.target_co2_reduction) * 100).toFixed(0)}% of target
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eco Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(totalCO2 * 10)}</div>
              <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Carbon Footprint</CardTitle>
              <CardDescription>Emissions by category this month</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <EmissionsChart data={categoryData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activities logged yet. Start tracking to see your impact!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest logged activities</CardDescription>
              </div>
              <Button onClick={() => setShowActivityForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </CardHeader>
            <CardContent>
              {showActivityForm ? (
                <ActivityForm onSuccess={handleActivityAdded} />
              ) : (
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div>
                          <p className="font-medium capitalize">{activity.activity_type}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{Number(activity.co2_kg).toFixed(1)} kg</p>
                          <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No activities yet. Click "Log Activity" to get started!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ChallengesList />
      </main>
    </div>
  );
};

export default Dashboard;
