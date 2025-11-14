import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  savings_kg: number;
  duration_days: number;
  category: string;
  icon: string;
}

interface UserChallenge {
  challenge_id: string;
  status: string;
}

const ChallengesList = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .limit(5);

      setChallenges(challengesData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userChallengesData } = await supabase
          .from("user_challenges")
          .select("challenge_id, status")
          .eq("user_id", user.id);

        setUserChallenges(userChallengesData || []);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to join challenges");
        return;
      }

      const { error } = await supabase.from("user_challenges").insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: "active",
      });

      if (error) throw error;

      toast.success("Challenge joined! Good luck!");
      loadChallenges();
    } catch (error: any) {
      toast.error(error.message || "Failed to join challenge");
    }
  };

  const isJoined = (challengeId: string) => {
    return userChallenges.some(
      (uc) => uc.challenge_id === challengeId && uc.status === "active"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Challenges</CardTitle>
        <CardDescription>Join challenges and reduce your carbon footprint together</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{challenge.icon}</span>
                <Badge variant="secondary">{challenge.category}</Badge>
              </div>
              <h3 className="font-semibold mb-1">{challenge.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Save up to</p>
                  <p className="font-bold text-success">{challenge.savings_kg} kg CO₂</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleJoinChallenge(challenge.id)}
                  disabled={isJoined(challenge.id)}
                  variant={isJoined(challenge.id) ? "secondary" : "default"}
                >
                  {isJoined(challenge.id) ? "Joined" : "Join"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {challenge.duration_days} day challenge
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengesList;
