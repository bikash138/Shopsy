import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Route } from "./+types/profile";
import type { UserProfile } from "~/api";
import { requireUser } from "~/lib/auth.server";
import { useProfile, useUpdateProfile } from "~/hooks";
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
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Profile · Shopsy" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return null;
}

interface ProfileForm {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function toForm(p?: UserProfile): ProfileForm {
  return {
    name: p?.name ?? "",
    street: p?.address?.street ?? "",
    city: p?.address?.city ?? "",
    state: p?.address?.state ?? "",
    postalCode: p?.address?.postalCode ?? "",
    country: p?.address?.country ?? "",
  };
}

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // Keep the form in sync with the loaded profile (stable ref → no clobbering edits).
  const values = useMemo(() => toForm(profile), [profile]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({ values });

  const onSubmit = handleSubmit((v) => {
    updateProfile.mutate({
      name: v.name,
      address: {
        street: v.street,
        city: v.city,
        state: v.state,
        postalCode: v.postalCode,
        country: v.country,
      },
    });
  });

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-80 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold">Profile</h1>

      <Card className="mt-6 p-6">
        <CardHeader className="px-0">
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
          <div className="pt-1">
            <Badge variant="secondary" className="capitalize">
              {profile.role}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="pt-2 text-sm font-medium text-muted-foreground">
              Shipping address
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" {...register("street")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" {...register("postalCode")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 w-fit"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
