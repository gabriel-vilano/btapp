import { OrganizationNotFound } from "@/src/components/explore/OrganizationPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

export default function OrganizationRouteNotFound() {
  return (
    <>
      <DetailHeader title="Organização" />
      <main>
        <OrganizationNotFound />
      </main>
    </>
  );
}
