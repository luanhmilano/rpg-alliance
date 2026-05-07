import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Account created successfully
              </CardTitle>
              <CardDescription>Waiting for KAGE approval</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your account was created. You can log in, but protected access
                will be enabled only after a KAGE approves your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
