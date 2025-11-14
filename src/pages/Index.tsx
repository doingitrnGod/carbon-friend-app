import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart3, Target, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/10">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">EcoTrack</span>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Track Your Carbon Footprint,
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Make a Difference</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor your daily activities, understand your environmental impact, and take meaningful steps toward a sustainable future.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Tracking Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Analytics</h3>
              <p className="text-muted-foreground">
                Visualize your carbon footprint with detailed charts and insights by category.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Set Goals</h3>
              <p className="text-muted-foreground">
                Create reduction targets and track your progress toward a greener lifestyle.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Join Challenges</h3>
              <p className="text-muted-foreground">
                Participate in community challenges and make sustainable living fun.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Make a Change?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of users tracking their carbon footprint and building a sustainable future.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started Today
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 EcoTrack. Track your impact, reduce your footprint.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
