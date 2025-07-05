import { httpRouter } from "convex/server"; // Import the Convex HTTP router
import { WebhookEvent } from "@clerk/nextjs/server"; // Import the Clerk WebhookEvent type
import { Webhook } from "svix"; // Import the svix library for handling webhooks
import { api } from "./_generated/api"; // Import the Convex API in _generated
import { httpAction } from "./_generated/server"; // Import the Convex HTTP action

import { GoogleGenerativeAI } from "@google/generative-ai"; // Import the Google Generative AI library

const http = httpRouter(); // Create a new Convex HTTP router

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Use the Gemini API key from environment variables

// clerk-webhook endpoint (for user creation and updates)
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    //ctx for context
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET missing");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");
    if (!svix_id || !svix_signature || !svix_timestamp) {
      //malicious user
      return new Response("Missing svix headers", {
        status: 400,
      });
    }

    const payload = await request.json(); // Get the request body as text
    const body = JSON.stringify(payload); // Convert the payload to a JSON string
    const webhook = new Webhook(webhookSecret);

    // verify the webhook event using svix
    let evt: WebhookEvent;
    try {
      evt = webhook.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent; // Verify the webhook event
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return new Response("Invalid webhook signature", {
        status: 400,
      });
    }

    const eventType = evt.type; // Get the event type from the webhook event

    // handle User.created event (to create user in Convex)
    if (eventType == "user.created") {
      //if so, extract user data
      const { id, first_name, last_name, image_url, email_addresses } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          //mutation is to sync the user data with Convex
          email,
          name,
          image: image_url,
          clerkId: id,
        }); //_
      } catch (error) {
        console.error("Error syncing user:", error);
        return new Response("Error syncing user", {
          status: 500,
        });
      }
    }

    // handle User.updated event (to store updated user data in Convex)
    if (eventType == "user.updated") {
      //check for all changes
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, { //another mutation in users.ts
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }


    return new Response("Webhook processed successfully", {
      status: 200,
    });
  }),
});

//* helper functions to validate AI results -----------------------------------

// validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan: any) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: any) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: any) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan: any) {
  // only keep the fields we want
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal: any) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

//* ---------------------------------------------------------------------------

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      const {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      } = payload;

      console.log("Received payload:", payload); // Log the received payload

      //GEMINI to generate a fitness program and diet plan
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-001", //gemini model
        generationConfig: {
          temperature: 0.4, // lower temperature for more focused responses
          topP: 0.9,
          responseMimeType: "application/json",
        },
      });

      // the prompt for Gemini to generate the WORKOUT plan
      const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }

      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const workoutResult = await model.generateContent(workoutPrompt); //Gemini result (1)
      const workoutPlanText = workoutResult.response.text(); // get text (2)

      let workoutPlan = JSON.parse(workoutPlanText); // Parse the text (3)
      workoutPlan = validateWorkoutPlan(workoutPlan); // then validate the plan (4)


      // the prompt for DIET plan
      const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const dietResult = await model.generateContent(dietPrompt); //Gemini result (1)
      const dietPlanText = dietResult.response.text(); // get text (2)

      let dietPlan = JSON.parse(dietPlanText); // Parse the text (3)
      dietPlan = validateDietPlan(dietPlan); // then validate the plan (4)

      // * Save to database: Convex
      const planId = await ctx.runMutation(api.plans.createPlan, { // run the createPlan mutation
        userId: user_id, //from payload from Vapi
        dietPlan,
        isActive: true,
        workoutPlan,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`, // name the plan with goal and date
      });

      // Return the plan ID as a response
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          }
        }),
        {
        status: 200,
        headers: {"Content-Type": "application/json",},
      });

    } catch (error) {
      console.log("Error in creating plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
        status: 500,
        headers: {"Content-Type": "application/json",},
      });
    }
  }),
});

export default http; // Export the HTTP router for use in the Convex server
