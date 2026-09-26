import { CompetitionBlock } from "@/src/components/feed/CompetitionBlock";
import type { EnrollmentCard as EnrollmentCardData } from "@/src/types/feed";

interface EnrollmentCardProps {
  data: EnrollmentCardData;
}

export function EnrollmentCard({ data }: EnrollmentCardProps) {
  return <CompetitionBlock competition={data.competition} />;
}
