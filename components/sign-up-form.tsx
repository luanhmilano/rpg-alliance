"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SignUpStep = 1 | 2 | 3;

type LookupOption = { id: string; name: string };

type SignUpApiResponse = {
  ok: boolean;
  error?: { message?: string };
};

function toPhoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isMaskedPhoneComplete(phone: string) {
  return /^\(\d{2}\)\s\d{5}-\d{4}$/.test(phone);
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [step, setStep] = useState<SignUpStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [villageId, setVillageId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [villages, setVillages] = useState<LookupOption[]>([]);
  const [characters, setCharacters] = useState<LookupOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLookupLoading(true);
    Promise.all([
      fetch("/api/villages").then((r) => r.json()),
      fetch("/api/characters").then((r) => r.json()),
    ])
      .then(([v, c]) => {
        setVillages(v.data ?? []);
        setCharacters(c.data ?? []);
      })
      .catch(() => {
        setError("Erro ao carregar vilas e personagens");
      })
      .finally(() => setLookupLoading(false));
  }, []);

  const goToNextStep = () => {
    setError(null);

    if (step === 1) {
      if (!email.trim()) {
        setError("Informe um e-mail valido");
        return;
      }

      if (password.length < 8) {
        setError("A senha precisa ter no minimo 8 caracteres");
        return;
      }

      if (password !== repeatPassword) {
        setError("As senhas precisam ser iguais");
        return;
      }

      setStep(2);
      return;
    }

    if (!isMaskedPhoneComplete(phone)) {
      setError("Informe um telefone no formato (XX) XXXXX-XXXX");
      return;
    }

    if (!villageId || !characterId) {
      setError("Selecione vila e personagem para continuar");
      return;
    }

    setStep(3);
  };

  const goToPreviousStep = () => {
    setError(null);
    setStep((current) => (current === 1 ? 1 : ((current - 1) as SignUpStep)));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (step < 3) {
        goToNextStep();
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          phone,
          villageId,
          characterId,
        }),
      });

      const payload = (await response.json()) as SignUpApiResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Falha ao cadastrar usuario");
      }

      router.push("/pending");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVillage = villages.find((item) => item.id === villageId);
  const selectedCharacter = characters.find((item) => item.id === characterId);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>
            Crie sua conta em etapas com e-mail, telefone e personagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="text-sm text-muted-foreground">
                Etapa {step} de 3
              </div>

              {step === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Senha</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password">Confirmar Senha</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      required
                      value={phone}
                      onChange={(e) => setPhone(toPhoneMask(e.target.value))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="village">Vila</Label>
                    <select
                      id="village"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={villageId}
                      onChange={(e) => setVillageId(e.target.value)}
                      required
                      disabled={lookupLoading}
                    >
                      <option value="">
                        {lookupLoading ? "Carregando..." : "Selecione uma vila"}
                      </option>
                      {villages.map((village) => (
                        <option key={village.id} value={village.id}>
                          {village.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="character">Personagem</Label>
                    <select
                      id="character"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={characterId}
                      onChange={(e) => setCharacterId(e.target.value)}
                      required
                      disabled={lookupLoading}
                    >
                      <option value="">
                        {lookupLoading ? "Carregando..." : "Selecione um personagem"}
                      </option>
                      {characters.map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-3 rounded-md border p-4 text-sm">
                  <p className="font-medium">Revise seu cadastro</p>
                  <p>
                    <span className="font-medium">E-mail:</span> {email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span> {phone}
                  </p>
                  <p>
                    <span className="font-medium">Vila:</span>{" "}
                    {selectedVillage?.name ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Personagem:</span>{" "}
                    {selectedCharacter?.name ?? "-"}
                  </p>
                  <p className="text-muted-foreground">
                    Seu acesso sera criado como MEMBER e aguardara aprovacao.
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={goToPreviousStep}
                  disabled={isLoading || step === 1}
                >
                  Voltar
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "Enviando..."
                    : step < 3
                      ? "Continuar"
                      : "Concluir cadastro"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
