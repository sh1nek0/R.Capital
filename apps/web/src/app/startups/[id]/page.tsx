import { StartupDetailClient } from "@/components/startup-detail-client";
import {
  getShowcaseStartup,
  getShowcaseStartupScore,
  showcaseStartups
} from "@/lib/showcase";

type StartupDetailPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return showcaseStartups.map((startup) => ({
    id: startup.id
  }));
}

export default function StartupDetailPage({ params }: StartupDetailPageProps) {
  const startup = getShowcaseStartup(params.id);

  return (
    <StartupDetailClient
      startupId={params.id}
      startup={startup}
      score={startup ? getShowcaseStartupScore(startup) : undefined}
    />
  );
}
