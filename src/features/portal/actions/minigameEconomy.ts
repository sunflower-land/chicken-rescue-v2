import { getUrl } from "features/portal/actions/loadPortal";

export type MinigameSessionResponse = {
  farm: {
    balance: string;
    bumpkin?: unknown;
  };
  minigame: {
    balances: Record<string, number>;
    producing: Record<
      string,
      { outputToken: string; startedAt: number; completesAt: number }
    >;
    activity: number;
    dailyActivity: { date: string; count: number };
    /** Present when API returns the extended minigame payload. */
    dailyMinted?: { utcDay: string; minted: Record<string, number> };
  };
  actions: Record<string, unknown>;
};

export type MinigameActionResponse = {
  minigame: MinigameSessionResponse["minigame"];
  producingId?: string;
};

export async function getMinigameSession({
  portalId,
  token,
}: {
  portalId: string;
  token: string;
}): Promise<MinigameSessionResponse> {
  const base = getUrl();
  if (!base) {
    throw new Error("No API URL");
  }

  const response = await window.fetch(
    `${base}/portal/${portalId}/minigame`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status >= 400) {
    const text = await response.text();
    throw new Error(text || `Minigame session ${response.status}`);
  }

  return response.json();
}

export async function postMinigameAction({
  portalId,
  token,
  action,
  itemId,
  amounts,
}: {
  portalId: string;
  token: string;
  action: string;
  itemId?: string;
  amounts?: Record<string, number>;
}): Promise<MinigameActionResponse> {
  const base = getUrl();
  if (!base) {
    throw new Error("No API URL");
  }

  const response = await window.fetch(
    `${base}/portal/${portalId}/minigame/action`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        ...(itemId !== undefined ? { itemId } : {}),
        ...(amounts !== undefined ? { amounts } : {}),
      }),
    },
  );

  const bodyText = await response.text();
  let data: { error?: string } & Partial<MinigameActionResponse> = {};
  try {
    data = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(bodyText || `Invalid JSON (${response.status})`);
  }

  if (response.status >= 400) {
    throw new Error(data.error || `Action failed (${response.status})`);
  }

  return data as MinigameActionResponse;
}
