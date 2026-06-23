"use client";

import type { ComponentProps } from "react";

import { TechniqueForm } from "@/components/techniques/technique-form";

type JutsuFormProps = Omit<ComponentProps<typeof TechniqueForm>, "variant">;

export function JutsuForm(props: JutsuFormProps) {
  return <TechniqueForm {...props} variant="JUTSU" />;
}