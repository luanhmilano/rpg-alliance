"use client";

import type { ComponentProps } from "react";

import { TechniqueForm } from "@/components/techniques/technique-form";

type SummoningFormProps = Omit<ComponentProps<typeof TechniqueForm>, "variant">;

export function SummoningForm(props: SummoningFormProps) {
  return <TechniqueForm {...props} variant="SUMMONING" />;
}