import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/signin";
import type { SigninPayload } from "~/api";
import { requireGuest } from "~/lib/auth.server";
import { useSignin } from "~/hooks";

export async function loader({ request }: Route.LoaderArgs) {
  await requireGuest(request);
  return null;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Sign in · Shopsy" }];
}

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signin = useSignin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninPayload>();

  const onSubmit = handleSubmit((values) => {
    const redirectTo = searchParams.get("redirectTo") || "/";
    signin.mutate(values, { onSuccess: () => navigate(redirectTo) });
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <Card className="p-6">
        <CardHeader className="px-0">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Shopsy account.</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={signin.isPending}>
              {signin.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
