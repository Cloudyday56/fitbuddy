"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dumbbell,
  Sparkles,
  Users,
  Clock,
  AppleIcon,
  ShieldIcon,
} from "lucide-react";
import { USER_PROGRAMS } from "@/constants";

// Collapsible description component
const DescriptionCollapse = ({
  description,
  open,
  setOpen,
}: {
  description: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  return (
    <div className="mt-8 border-t border-border bg-card/90 overflow-hidden p-0 rounded-b-xl">
      <button
        className={`w-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground text-left focus:outline-none hover:bg-primary/90 transition-colors ${open ? "rounded-t-none rounded-b-xl" : "rounded-b-xl"}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Hide Details" : "Show Details"}
      </button>
      {open && (
        <div className="px-6 py-6 text-sm text-muted-foreground animate-fadeIn bg-card/90 rounded-b-xl">
          <span className="text-primary">&gt; </span>
          {description}
        </div>
      )}
    </div>
  );
};

// todo: just UI

const UserPrograms = () => {
  // State for each card's collapse
  const [openStates, setOpenStates] = useState(
    Array(USER_PROGRAMS.length).fill(false)
  );

  const handleToggle = (idx: number) => {
    setOpenStates((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  return (
    <div className="w-full pb-24 pt-16 relative">
      <div className="container mx-auto max-w-6xl px-4">
        {/* HEADER- PROGRAM GALLERY */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden mb-16">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[var(--header-bg)]/90">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#00ccff" }}
              ></div>
              <span
                className="text-sm font-medium"
                style={{ color: "#00ccff" }}
              >
                Program Gallery
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Featured Plans</div>
          </div>

          {/* HEADER CONTENT */}
          <div className="p-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">AI-Generated </span>
              <span className="text-primary">Programs</span>
            </h2>

            <p className="text-lg text-muted-foreground mx-auto mb-10">
              Explore personalized fitness plans our AI assistant has created
              for other users
            </p>

            {/* STATS */}
            <div className="flex items-center justify-center gap-16 mt-10 font-mono">
              <div className="flex flex-col items-center">
                <p className="text-3xl text-primary">500+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  PROGRAMS
                </p>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="flex flex-col items-center">
                <p className="text-3xl text-primary">3min</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  CREATION TIME
                </p>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="flex flex-col items-center">
                <p className="text-3xl text-primary">100%</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  PERSONALIZED
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USER_PROGRAMS.map((program, idx) => (
            <Card
              key={program.id}
              className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors overflow-hidden"
            >
              {/* Card header with user info */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[var(--header-bg)]/90">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#00ccff" }}
                  ></div>
                  <span className="text-sm" style={{ color: "#00ccff" }}>
                    USER.{program.id}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {program.fitness_level.toUpperCase()}
                </div>
              </div>

              <CardHeader className="pt-8 px-8 bg-card/90 rounded-b-none">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-border">
                    <img
                      src={program.profilePic}
                      alt={`${program.first_name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {program.first_name}
                      <span className="text-primary">.exe</span>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      {program.age}y • {program.workout_days}d/week
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="px-3 py-1 bg-primary/20 rounded border border-primary/30 text-sm text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {program.fitness_goal}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    v3.5
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 py-6 bg-primary/5 rounded-t-none">
                {/* Program details */}
                <div className="space-y-5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/20 text-primary mt-0.5">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-foreground">
                          {program.workout_plan.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {program.equipment_access}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-secondary/20 text-secondary mt-0.5">
                      <AppleIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-foreground">
                          {program.diet_plan.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        System optimized nutrition
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/20 text-primary mt-0.5">
                      <ShieldIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-foreground">
                          AI Safety Protocols
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Protection systems enabled
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program description - collapsible */}
                <DescriptionCollapse
                  description={program.workout_plan.description}
                  open={openStates[idx]}
                  setOpen={() => handleToggle(idx)}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action section */}
        <div className="mt-16 text-center">
          <Link href="/generate-program">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
            >
              Generate Your Program
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground mt-4">
            Join them and shape your body with your own fitness programs
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPrograms;
