import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getDietRecommendations } from "@/utils/diseaseRecommendations";

const HealthTips = () => {
  const [recommendedDiets, setRecommendedDiets] = useState<string[]>([
    "Leafy green vegetables (spinach, kale)",
    "Whole grains (brown rice, quinoa)",
    "Lean proteins (chicken, fish, tofu)",
    "Fresh fruits (berries, apples, oranges)",
    "Nuts and seeds (almonds, chia seeds)",
  ]);

  const [foodsToAvoid, setFoodsToAvoid] = useState<string[]>([
    "Processed sugary foods and drinks",
    "Trans fats and fried foods",
    "Excessive red meat consumption",
    "High-sodium packaged foods",
    "Refined carbohydrates (white bread)",
  ]);

  useEffect(() => {
    const fetchHealthCondition = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('primary_health_condition')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.primary_health_condition) {
        const recommendations = getDietRecommendations(profile.primary_health_condition);
        setRecommendedDiets(recommendations.recommended);
        setFoodsToAvoid(recommendations.avoid);
      }
    };

    fetchHealthCondition();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recommended Diets */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            Top 5 Recommended Diets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendedDiets.map((diet, index) => (
              <li
                key={index}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">{diet}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Foods to Avoid */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            Top 5 Foods to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {foodsToAvoid.map((food, index) => (
              <li
                key={index}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">{food}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTips;
