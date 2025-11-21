export interface DietRecommendations {
  recommended: string[];
  avoid: string[];
}

export const getDietRecommendations = (condition: string): DietRecommendations => {
  const normalizedCondition = condition.toLowerCase();

  if (normalizedCondition.includes("diabetes")) {
    return {
      recommended: [
        "Leafy green vegetables (spinach, kale, methi)",
        "Whole grains (brown rice, quinoa, oats)",
        "Lean proteins (grilled chicken, fish, tofu)",
        "High-fiber foods (beans, lentils, chickpeas)",
        "Low-glycemic fruits (berries, apples, guava)",
      ],
      avoid: [
        "Refined carbohydrates (white bread, white rice)",
        "Sugary drinks and desserts",
        "Fried and processed foods",
        "High-sugar fruits (mangoes, bananas in excess)",
        "Trans fats and saturated fats",
      ],
    };
  }

  if (normalizedCondition.includes("hypertension") || normalizedCondition.includes("blood pressure") || normalizedCondition.includes("bp")) {
    return {
      recommended: [
        "Leafy greens (spinach, celery, beet greens)",
        "Berries rich in antioxidants (blueberries, strawberries)",
        "Potassium-rich foods (bananas, sweet potatoes)",
        "Whole grains (oatmeal, brown rice)",
        "Low-fat dairy (yogurt, skim milk)",
      ],
      avoid: [
        "High-sodium processed foods",
        "Canned soups and packaged snacks",
        "Pickles and preserved foods",
        "Excessive red meat",
        "Alcohol and caffeinated beverages",
      ],
    };
  }

  if (normalizedCondition.includes("thyroid")) {
    return {
      recommended: [
        "Iodine-rich foods (seaweed, fish, dairy)",
        "Selenium sources (brazil nuts, eggs, sunflower seeds)",
        "Zinc-rich foods (chickpeas, cashews, pumpkin seeds)",
        "Fresh fruits and vegetables",
        "Lean proteins (chicken, turkey, fish)",
      ],
      avoid: [
        "Excessive soy products (if hypothyroid)",
        "Cruciferous vegetables in large amounts (raw cabbage, broccoli)",
        "Processed and packaged foods",
        "Gluten (if sensitive)",
        "Excessive caffeine",
      ],
    };
  }

  if (normalizedCondition.includes("heart") || normalizedCondition.includes("cardiac") || normalizedCondition.includes("cholesterol")) {
    return {
      recommended: [
        "Fatty fish rich in Omega-3 (salmon, mackerel, sardines)",
        "Nuts and seeds (almonds, walnuts, flaxseeds)",
        "Whole grains (oats, barley, whole wheat)",
        "Fruits and vegetables (berries, citrus, leafy greens)",
        "Legumes (beans, lentils, chickpeas)",
      ],
      avoid: [
        "Trans fats and hydrogenated oils",
        "Red and processed meats",
        "Full-fat dairy products",
        "Fried foods and fast food",
        "High-sodium foods",
      ],
    };
  }

  if (normalizedCondition.includes("kidney") || normalizedCondition.includes("renal")) {
    return {
      recommended: [
        "Cauliflower and cabbage",
        "Red bell peppers",
        "Garlic and onions",
        "Apples and berries",
        "Egg whites (limited)",
      ],
      avoid: [
        "High-potassium foods (bananas, oranges, tomatoes)",
        "High-phosphorus foods (dairy, nuts, beans)",
        "Processed meats",
        "Canned foods with added salt",
        "Dark-colored sodas",
      ],
    };
  }

  // Default recommendations for general health
  return {
    recommended: [
      "Leafy green vegetables (spinach, kale)",
      "Whole grains (brown rice, quinoa)",
      "Lean proteins (chicken, fish, tofu)",
      "Fresh fruits (berries, apples, oranges)",
      "Nuts and seeds (almonds, chia seeds)",
    ],
    avoid: [
      "Processed sugary foods and drinks",
      "Trans fats and fried foods",
      "Excessive red meat consumption",
      "High-sodium packaged foods",
      "Refined carbohydrates (white bread)",
    ],
  };
};
