import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/signup";
import type { Role } from "~/api";
import { requireGuest } from "~/lib/auth.server";
import { useSignup } from "~/hooks";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Sign up · Shopsy" }];
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export default function SignUp() {
  const navigate = useNavigate();
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupForm>({ defaultValues: { role: "customer" } });

  const onSubmit = handleSubmit((values) => {
    signup.mutate(values, { onSuccess: () => navigate("/") });
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <Card className="p-6">
        <CardHeader className="px-0">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Start buying or selling on Shopsy.</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="At least 6 characters"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Must be at least 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">I want to</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Shop as a customer</SelectItem>
                      <SelectItem value="seller">Sell as a seller</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button type="submit" size="lg" disabled={signup.isPending}>
              {signup.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/signin" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
