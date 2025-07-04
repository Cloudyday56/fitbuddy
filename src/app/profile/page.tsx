"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import CornerElements from "@/components/CornerElements";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  console.log(user);
  const userId = user?.id as string; //type casting (typescript)

  const allPlans = useQuery(
    api.plans.getUserPlans,
    isLoaded && user?.id ? { userId: user.id } : "skip"
  );
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  //active plan
  const activePlan = allPlans?.find((plan) => plan.isActive);
  //selected plan
  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id == selectedPlanId)
    : activePlan;

  // show loading state as long as user data is not loaded (required)
  if (!isLoaded) {
    return (
      <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
        <div className="mb-10 relative backdrop-blur-sm border border-border p-6 animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted rounded"></div>
              <div className="h-4 w-60 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
      {user && <ProfileHeader user={user} />}
      {allPlans && allPlans?.length > 0 ? (
        <div className="space-y-8">
          {/* PLAN SELECTOR */}
          <div className="relative backdrop-blur-sm border border-border p-6">
            <CornerElements />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-primary">Your</span>{" "}
                <span className="text-foreground">Fitness Plans</span>
              </h2>
              <div className="font-mono text-s text-muted-foreground">
                TOTAL: {allPlans.length}
              </div>
            </div>
            {/* click to select a plan */}
            <div className="flex flex-wrap gap-2">
              {allPlans.map(
                (
                  plan //map all plans and can click to them
                ) => (
                  <Button
                    key={plan._id}
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`text-foreground border hover:text-white ${
                      selectedPlanId === plan._id
                        ? "bg-primary/20 text-primary border-primary"
                        : "bg-transparent border-border hover:border-primary/50"
                    }`}
                  >
                    {plan.name}
                    {plan.isActive && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(0, 204, 255, 0.2)",
                          color: "#00ccff",
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* PLAN DETAILS */}
          {currentPlan && (
            <div className="relative backdrop-blur-sm border border-border rounded-lg p-6">
              <CornerElements />
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#00ccff" }}
                ></div>
                <h3 className="text-lg font-bold">
                  PLAN: <span className="text-primary">{currentPlan.name}</span>
                </h3>
              </div>

              <Tabs defaultValue="workout" className="w-full">
                {/* Tab list */}
                <TabsList className="mb-6 w-full grid grid-cols-2 bg-cyber-terminal-bg border">
                  <TabsTrigger
                    value="workout"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <DumbbellIcon className="mr-2 size-4" />
                    Workout Plan
                  </TabsTrigger>

                  <TabsTrigger
                    value="diet"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <AppleIcon className="mr-2 h-4 w-4" />
                    Diet Plan
                  </TabsTrigger>
                </TabsList>

                {/* WORKOUT PLAN CONTENT */}
                <TabsContent value="workout">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm text-muted-foreground">
                        SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
                      </span>
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                      {" "}
                      {/* multiple allows multiple triggers to be opened at the same time*/}
                      {currentPlan.workoutPlan.exercises.map(
                        (
                          exerciseDay,
                          index //map each exercise day
                        ) => (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/10 font-mono">
                              <div className="flex justify-between w-full items-center">
                                <span className="text-primary">
                                  {exerciseDay.day}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {exerciseDay.routines.length} EXERCISES
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 mt-2">
                                {exerciseDay.routines.map(
                                  (
                                    routine,
                                    routineIndex //map each routine in the exercise day
                                  ) => (
                                    <div
                                      key={routineIndex}
                                      className="border border-border rounded p-3 bg-[var(--card)]/90"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-foreground">
                                          {routine.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                          <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
                                            {routine.sets} SETS
                                          </div>
                                          <div className="px-2 py-1 rounded bg-secondary/20 text-secondary text-xs font-mono">
                                            {routine.reps} REPS
                                          </div>
                                        </div>
                                      </div>
                                      {routine.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {routine.description}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </div>
                </TabsContent>

                {/* DIET PLAN CONTENT */}
                <TabsContent value="diet">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        DAILY CALORIE TARGET
                      </span>
                      <div className="font-mono text-xl text-primary">
                        {currentPlan.dietPlan.dailyCalories} KCAL
                      </div>
                    </div>

                    <div className="h-px w-full bg-border my-4"></div>

                    <div className="space-y-4">
                      {currentPlan.dietPlan.meals.map(
                        (
                          meal,
                          index //map each meal in the diet plan
                        ) => (
                          <div
                            key={index}
                            className="border border-border rounded-lg overflow-hidden p-4"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <h4 className="font-mono text-primary">
                                {meal.name}
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {meal.foods.map(
                                (
                                  food,
                                  foodIndex //map each food in the meal
                                ) => (
                                  <li
                                    key={foodIndex}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                  >
                                    <span className="text-xs text-primary font-mono">
                                      {String(foodIndex + 1).padStart(2, "0")}{" "}
                                      {/* add a preceding 0 */}
                                    </span>
                                    {food}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      ) : (
        <NoFitnessPlan />
      )}
    </section>
  );
};

export default ProfilePage;
