import { useEffect, useState } from "react";

export type NuggetProductionJob = {
  id: string;
  startedAt: number;
  completesAt: number;
};

export function findNuggetJob(
  producing: Record<
    string,
    { outputToken: string; startedAt: number; completesAt: number }
  >,
): NuggetProductionJob | null {
  for (const [id, job] of Object.entries(producing)) {
    if (job.outputToken === "Nugget") {
      return {
        id,
        startedAt: job.startedAt,
        completesAt: job.completesAt,
      };
    }
  }
  return null;
}

export function nuggetCookProgressPercent(
  job: NuggetProductionJob,
  now: number,
): number {
  const total = job.completesAt - job.startedAt;
  if (total <= 0) return 100;
  return Math.min(
    100,
    Math.max(0, ((now - job.startedAt) / total) * 100),
  );
}

export function useNowTicker(intervalMs = 400): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
