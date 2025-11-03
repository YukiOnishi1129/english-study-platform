import { ProfilePageTemplate } from "@/features/profile/components/server";

export default async function ProfilePage(_: PageProps<"/profile">) {
  return <ProfilePageTemplate />;
}
