type ElectionLiveSource = {
  key: string;
  name: string;
  url: string;
  type: "rss" | "html";
};

type ElectionUpdate = {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  source: string;
};

type SourceHealth = {
  key: string;
  name: string;
  url: string;
  status: "ok" | "degraded" | "offline";
  itemCount: number;
  lastSync: string;
  error?: string;
};

type OfficialPartyTally = {
  partyId: number;
  partyName: string;
  wins: number;
  leads: number;
  total: number;
  symbolId?: number;
};

type ProportionalPartyResult = {
  name: string;
  votes: number | null;
  percentage?: string | null;
  seats?: number | null;
};

type AreaDetailResult = {
  area: string;
  province?: string | null;
  district?: string | null;
  winner?: string | null;
  party?: string | null;
  status?: string | null;
  votes?: number | null;
};

type ElectionExplorerSection<T> = {
  available: boolean;
  pageUrl: string;
  source: string;
  itemCount: number;
  items: T[];
  rawSnippets: string[];
  error?: string;
};

type ElectionOfficialSession = {
  html: string;
  csrfToken: string;
  cookieHeader: string;
};

export type NepalElectionLookupOption = {
  id: number;
  name: string;
  parentId?: number;
};

export type NepalElectionConstituencyLookup = {
  distId: number;
  consts: number;
};

export type NepalElectionPrResult = {
  SerialNo: number;
  PartyID: number;
  SymbolID: number;
  SymbolName: string;
  PoliticalPartyName: string;
  DistrictCd: number;
  DistrictName: string | null;
  StateID: number;
  SCConstID: number;
  CenterConstID: number;
  OrderID: number;
  TotalVoteReceived: number;
};

export type NepalElectionPrExplorerPayload = {
  generatedAt: string;
  selection: {
    stateId: number | null;
    districtId: number | null;
    constituencyId: number | null;
  };
  lookups: {
    states: NepalElectionLookupOption[];
    districts: NepalElectionLookupOption[];
    constituencies: NepalElectionConstituencyLookup[];
  };
  results: NepalElectionPrResult[];
  source: string;
};

export type NepalElectionLivePayload = {
  generatedAt: string;
  official: {
    election: string;
    source: string;
    available: boolean;
    totalConstituencies: number;
    totalLeadingOrWon: number;
    parties: OfficialPartyTally[];
  };
  explorer: {
    proportional: ElectionExplorerSection<ProportionalPartyResult>;
    area: ElectionExplorerSection<AreaDetailResult>;
  };
  sources: SourceHealth[];
  updates: ElectionUpdate[];
};

const SOURCES: ElectionLiveSource[] = [
  {
    key: "onlinekhabar",
    name: "Onlinekhabar",
    url: "https://www.onlinekhabar.com/content/news/feed",
    type: "rss",
  },
  {
    key: "ekantipur",
    name: "Ekantipur",
    url: "https://ekantipur.com/rss",
    type: "rss",
  },
];

const ELECTION_KEYWORDS = [
  "election",
  "elections",
  "vote",
  "voting",
  "ballot",
  "constituency",
  "poll",
  "निर्वाचन",
  "मत",
  "मतदान",
  "मतगणना",
  "प्रतिनिधि सभा",
  "स्थानीय तह",
  "उम्मेदवार",
  "सिट",
];

const RESULTS_PAGE_URL = "https://result.election.gov.np/FPTPWLChartResult2082.aspx";
const OFFICIAL_TALLY_URL = "https://result.election.gov.np/Handlers/SecureJson.ashx?file=JSONFiles/Election2082/Common/HoRPartyTop5.txt";
const PROPORTIONAL_RESULTS_URL = "https://result.election.gov.np/PRVoteChartResult2082.aspx";
const AREA_RESULTS_URL = "https://result.election.gov.np/PRMapElectionResult2082.aspx";

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string): string {
  return decodeXmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function htmlToTextLines(html: string): string[] {
  return decodeXmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|tr|li|section|article|h[1-6])>/gi, "\n")
      .replace(/<(td|th)[^>]*>/gi, " | ")
  )
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractHtmlTableRows(html: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      const text = stripHtml(cellMatch[2]);
      if (text) cells.push(text);
    }

    if (cells.length) rows.push(cells);
  }

  return rows;
}

function isHeaderLikeRow(cells: string[]): boolean {
  const joined = cells.join(" ").toLowerCase();
  return (
    joined.includes("पार्टी") ||
    joined.includes("party") ||
    joined.includes("मत") ||
    joined.includes("vote") ||
    joined.includes("क्षेत्र") ||
    joined.includes("area") ||
    joined.includes("district") ||
    joined.includes("status")
  );
}

async function fetchOfficialHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.text();
}

async function fetchOfficialJson<T>(path: string, referer: string): Promise<T> {
  const { csrfToken, cookieHeader } = await bootstrapOfficialSession(referer);
  const response = await fetch(`https://result.election.gov.np/Handlers/SecureJson.ashx?file=${path}`, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Accept: "application/json,text/plain,*/*",
      Referer: referer,
      Origin: "https://result.election.gov.np",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-Token": csrfToken,
      Cookie: cookieHeader || `CsrfToken=${csrfToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Official JSON fetch failed: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getNepalElectionPrExplorerPayload(selection: {
  stateId?: number | null;
  districtId?: number | null;
  constituencyId?: number | null;
} = {}): Promise<NepalElectionPrExplorerPayload> {
  const [states, districts, constituencies] = await Promise.all([
    fetchOfficialJson<NepalElectionLookupOption[]>(
      "JSONFiles/Election2082/Local/Lookup/states.json",
      AREA_RESULTS_URL
    ),
    fetchOfficialJson<NepalElectionLookupOption[]>(
      "JSONFiles/Election2082/Local/Lookup/districts.json",
      AREA_RESULTS_URL
    ),
    fetchOfficialJson<NepalElectionConstituencyLookup[]>(
      "JSONFiles/Election2082/HOR/Lookup/constituencies.json",
      AREA_RESULTS_URL
    ),
  ]);

  const stateId = selection.stateId ?? null;
  const districtId = selection.districtId ?? null;
  const constituencyId = selection.constituencyId ?? null;

  let resultPath: string | null = null;
  if (districtId && constituencyId) {
    resultPath = `JSONFiles/Election2082/HOR/PR/HOR/HOR-${districtId}-${constituencyId}.json`;
  } else if (districtId) {
    resultPath = `JSONFiles/Election2082/HOR/PR/District/${districtId}.json`;
  } else if (stateId) {
    resultPath = `JSONFiles/Election2082/HOR/PR/Province/${stateId}.json`;
  }

  const results = resultPath
    ? await fetchOfficialJson<NepalElectionPrResult[]>(resultPath, AREA_RESULTS_URL)
    : [];

  return {
    generatedAt: new Date().toISOString(),
    selection: { stateId, districtId, constituencyId },
    lookups: { states, districts, constituencies },
    results,
    source: "result.election.gov.np",
  };
}

async function fetchProportionalExplorer(): Promise<ElectionExplorerSection<ProportionalPartyResult>> {
  try {
    const html = await fetchOfficialHtml(PROPORTIONAL_RESULTS_URL);
    const rows = extractHtmlTableRows(html);
    const parties: ProportionalPartyResult[] = [];
    const seen = new Set<string>();

    for (const cells of rows) {
      if (cells.length < 2 || isHeaderLikeRow(cells)) continue;
      const name = cells[0]?.trim();
      if (!name || name.length < 2 || seen.has(name)) continue;

      const numericCells = cells.slice(1).map((cell) => parseNumber(cell));
      const percentageCell = cells.find((cell) => cell.includes("%")) || null;
      const firstNumeric = numericCells.find((value) => value !== null) ?? null;
      const secondNumeric = numericCells.filter((value) => value !== null)[1] ?? null;

      if (firstNumeric === null && !percentageCell) continue;

      seen.add(name);
      parties.push({
        name,
        votes: firstNumeric,
        percentage: percentageCell,
        seats: secondNumeric,
      });
    }

    const rawSnippets = htmlToTextLines(html)
      .filter((line) => /मत|vote|party|पार्टी|seat|सिट/i.test(line))
      .slice(0, 40);

    return {
      available: parties.length > 0 || rawSnippets.length > 0,
      pageUrl: PROPORTIONAL_RESULTS_URL,
      source: "result.election.gov.np",
      itemCount: parties.length || rawSnippets.length,
      items: parties.slice(0, 50),
      rawSnippets,
    };
  } catch (error: any) {
    return {
      available: false,
      pageUrl: PROPORTIONAL_RESULTS_URL,
      source: "result.election.gov.np",
      itemCount: 0,
      items: [],
      rawSnippets: [],
      error: error?.message || "Failed to load proportional result view",
    };
  }
}

async function fetchAreaExplorer(): Promise<ElectionExplorerSection<AreaDetailResult>> {
  try {
    const html = await fetchOfficialHtml(AREA_RESULTS_URL);
    const rows = extractHtmlTableRows(html);
    const entries: AreaDetailResult[] = [];
    const seen = new Set<string>();

    for (const cells of rows) {
      if (cells.length < 3 || isHeaderLikeRow(cells)) continue;
      const area = cells[0]?.trim();
      if (!area || area.length < 2) continue;

      const signature = cells.join("|");
      if (seen.has(signature)) continue;
      seen.add(signature);

      const votes = cells.map((cell) => parseNumber(cell)).find((value) => value !== null) ?? null;

      entries.push({
        area,
        province: cells.find((cell) => /प्रदेश|province/i.test(cell)) || null,
        district: cells.find((cell) => /जिल्ला|district/i.test(cell)) || null,
        winner: cells[1] || null,
        party: cells[2] || null,
        status: cells.find((cell) => /जीत|lead|leading|won|status/i.test(cell)) || null,
        votes,
      });
    }

    const rawSnippets = htmlToTextLines(html)
      .filter((line) => /क्षेत्र|जिल्ला|province|district|candidate|party|पार्टी/i.test(line))
      .slice(0, 50);

    return {
      available: entries.length > 0 || rawSnippets.length > 0,
      pageUrl: AREA_RESULTS_URL,
      source: "result.election.gov.np",
      itemCount: entries.length || rawSnippets.length,
      items: entries.slice(0, 80),
      rawSnippets,
    };
  } catch (error: any) {
    return {
      available: false,
      pageUrl: AREA_RESULTS_URL,
      source: "result.election.gov.np",
      itemCount: 0,
      items: [],
      rawSnippets: [],
      error: error?.message || "Failed to load area result view",
    };
  }
}

function looksElectionRelated(text: string): boolean {
  const normalized = text.toLowerCase();
  return ELECTION_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function parseRss(xml: string, source: ElectionLiveSource): ElectionUpdate[] {
  const updates: ElectionUpdate[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const item = itemMatch[1];
    const title = stripHtml((item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
    const link = stripHtml((item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "");
    const description = stripHtml((item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "");
    const pubDate = stripHtml((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "");
    if (!title || !link) continue;
    if (!looksElectionRelated(`${title} ${description}`)) continue;

    updates.push({
      title,
      link,
      summary: description,
      publishedAt: pubDate || new Date().toISOString(),
      source: source.name,
    });
  }

  return updates.slice(0, 30);
}

async function fetchSource(source: ElectionLiveSource): Promise<{ updates: ElectionUpdate[]; health: SourceHealth }> {
  try {
    const res = await fetch(source.url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return {
        updates: [],
        health: {
          key: source.key,
          name: source.name,
          url: source.url,
          status: "offline",
          itemCount: 0,
          lastSync: new Date().toISOString(),
          error: `HTTP ${res.status}`,
        },
      };
    }

    const body = await res.text();
    const updates = source.type === "rss" ? parseRss(body, source) : [];

    return {
      updates,
      health: {
        key: source.key,
        name: source.name,
        url: source.url,
        status: updates.length ? "ok" : "degraded",
        itemCount: updates.length,
        lastSync: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return {
      updates: [],
      health: {
        key: source.key,
        name: source.name,
        url: source.url,
        status: "offline",
        itemCount: 0,
        lastSync: new Date().toISOString(),
        error: error?.message || "Fetch failed",
      },
    };
  }
}

function parseCsrfTokenFromCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  const match = setCookieHeader.match(/CsrfToken=([^;]+)/i);
  return match?.[1] || "";
}

function getSetCookieHeaders(response: Response): string[] {
  const headersAny = response.headers as any;
  if (typeof headersAny.getSetCookie === "function") {
    const values = headersAny.getSetCookie();
    if (Array.isArray(values) && values.length) return values;
  }
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

function parseCsrfTokenFromSetCookies(headers: string[]): string {
  for (const header of headers) {
    const token = parseCsrfTokenFromCookie(header);
    if (token) return token;
  }
  return "";
}

function buildCookieHeader(setCookieHeaders: string[]): string {
  return setCookieHeaders
    .map((header) => header.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function bootstrapOfficialSession(targetUrl: string = RESULTS_PAGE_URL): Promise<ElectionOfficialSession> {
  const bootstrapUrls = [RESULTS_PAGE_URL, "https://result.election.gov.np/"];
  if (!bootstrapUrls.includes(targetUrl)) {
    bootstrapUrls.unshift(targetUrl);
  }
  for (const url of bootstrapUrls) {
    const homeRes = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!homeRes.ok) continue;

    const html = await homeRes.text();
    const setCookieHeaders = getSetCookieHeaders(homeRes);
    const csrfToken = parseCsrfTokenFromSetCookies(setCookieHeaders);
    const cookieHeader = buildCookieHeader(setCookieHeaders);
    if (csrfToken) return { html, csrfToken, cookieHeader };
  }
  throw new Error("Official source CSRF token not available");
}

async function fetchOfficialPartyTallies(): Promise<{ election: string; totalConstituencies: number; parties: OfficialPartyTally[] }> {
  const { html, csrfToken, cookieHeader } = await bootstrapOfficialSession();

  const electionNameMatch = html.match(/<h2>\s*([^<]+)\s*<\/h2>/i);
  const election = stripHtml(electionNameMatch?.[1] || "प्रतिनिधि सभा निर्वाचन");
  const totalConstituenciesMatch = html.match(/tott:\s*(\d+)/i);
  const totalConstituencies = Number(totalConstituenciesMatch?.[1] || 0);

  const tallyHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    Accept: "application/json,text/plain,*/*",
    Referer: RESULTS_PAGE_URL,
    Origin: "https://result.election.gov.np",
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRF-Token": csrfToken,
    Cookie: cookieHeader || `CsrfToken=${csrfToken}`,
  };

  let raw: any = null;
  let lastStatus = 0;
  let lastError = "No valid JSON from official source";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(OFFICIAL_TALLY_URL, {
      cache: "no-store",
      headers: tallyHeaders,
    });
    lastStatus = res.status;
    if (!res.ok) {
      lastError = `HTTP ${res.status}`;
      continue;
    }
    const text = await res.text();
    // Election Commission may return HTML (block page, error, or maintenance) instead of JSON
    const trimmed = text.trim();
    if (trimmed.startsWith("<") || trimmed.startsWith("<!")) {
      lastError = "Official source returned HTML instead of data (site may be blocked or changed)";
      continue;
    }
    try {
      raw = JSON.parse(text);
      break;
    } catch {
      lastError = "Invalid JSON from official source";
      continue;
    }
  }
  if (!raw) {
    throw new Error(`${lastError}. Status: ${lastStatus || 403}`);
  }
  const parties: OfficialPartyTally[] = Array.isArray(raw)
    ? raw.map((row: any) => ({
        partyId: Number(row?.PartyId || 0),
        partyName: stripHtml(String(row?.PoliticalPartyName || "Unknown")),
        wins: Number(row?.TotWin || 0),
        leads: Number(row?.TotLead || 0),
        total: Number(row?.TotWinLead || (Number(row?.TotWin || 0) + Number(row?.TotLead || 0))),
        symbolId: Number(row?.SymbolID || 0),
      }))
    : [];

  return {
    election,
    totalConstituencies: totalConstituencies || 165,
    parties: parties.sort((a, b) => b.total - a.total),
  };
}

/** Fallback: scrape party tally from EC results page HTML when JSON API fails */
async function scrapeOfficialTallyFromHtml(): Promise<{
  election: string;
  totalConstituencies: number;
  parties: OfficialPartyTally[];
} | null> {
  try {
    const res = await fetch(RESULTS_PAGE_URL, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const election = stripHtml((html.match(/<h2>\s*([^<]+)\s*<\/h2>/i) || [])[1] || "प्रतिनिधि सभा निर्वाचन");
    const tottMatch = html.match(/tott:\s*(\d+)/i);
    const totalConstituencies = Number(tottMatch?.[1] || 165);

    // Try JSON in script: look for array-like pattern with PartyId/PoliticalPartyName
    const scriptMatch = html.match(/PoliticalPartyName|TotWin|TotLead/);
    if (scriptMatch) {
      const arrayLike = html.match(/\[\s*\{[\s\S]{20,500}\}\s*\]/);
      if (arrayLike) {
        try {
          const normalized = arrayLike[0]
            .replace(/(\w+)\s*:/g, '"$1":')
            .replace(/,\s*}/g, "}");
          const raw = JSON.parse(normalized);
          if (Array.isArray(raw) && raw.length && raw.some((r: any) => r.PoliticalPartyName != null || r.partyName != null)) {
            const parties: OfficialPartyTally[] = raw.map((row: any) => ({
              partyId: Number(row?.PartyId ?? row?.partyId ?? 0),
              partyName: stripHtml(String(row?.PoliticalPartyName ?? row?.partyName ?? "Unknown")),
              wins: Number(row?.TotWin ?? row?.wins ?? 0),
              leads: Number(row?.TotLead ?? row?.leads ?? 0),
              total: Number(row?.TotWinLead ?? row?.total ?? (Number(row?.TotWin ?? 0) + Number(row?.TotLead ?? 0))),
              symbolId: Number(row?.SymbolID ?? row?.symbolId ?? 0),
            }));
            return {
              election,
              totalConstituencies,
              parties: parties.sort((a, b) => b.total - a.total).slice(0, 15),
            };
          }
        } catch {
          /* ignore */
        }
      }
    }

    // Fallback: look for table rows with party name and numbers (e.g. <tr>...party...lead...win...</tr>)
    const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?([\u0900-\u097F\w\s]+)[\s\S]*?<\/td>[\s\S]*?<td[^>]*>[\s\S]*?(\d+)[\s\S]*?<\/td>[\s\S]*?<td[^>]*>[\s\S]*?(\d+)[\s\S]*?<\/td>/gi;
    const parties: OfficialPartyTally[] = [];
    let rowMatch: RegExpExecArray | null;
    let id = 0;
    while ((rowMatch = rowRegex.exec(html)) !== null && parties.length < 15) {
      const name = stripHtml(rowMatch[1]).trim();
      const lead = Number(rowMatch[2] || 0);
      const win = Number(rowMatch[3] || 0);
      if (name.length < 2) continue;
      parties.push({
        partyId: ++id,
        partyName: name,
        wins: win,
        leads: lead,
        total: win + lead,
      });
    }
    if (parties.length === 0) return null;
    return {
      election,
      totalConstituencies,
      parties: parties.sort((a, b) => b.total - a.total),
    };
  } catch {
    return null;
  }
}

export async function getNepalElectionLivePayload(): Promise<NepalElectionLivePayload> {
  const [settled, proportional, area] = await Promise.all([
    Promise.all(SOURCES.map((source) => fetchSource(source))),
    fetchProportionalExplorer(),
    fetchAreaExplorer(),
  ]);
  const sources = settled.map((s) => s.health);
  const updates = settled
    .flatMap((s) => s.updates)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 40);

  let official: NepalElectionLivePayload["official"] = {
    election: "प्रतिनिधि सभा निर्वाचन",
    source: "Election Commission, Nepal",
    available: false,
    totalConstituencies: 0,
    totalLeadingOrWon: 0,
    parties: [],
  };

  try {
    const tally = await fetchOfficialPartyTallies();
    official = {
      election: tally.election,
      source: "result.election.gov.np",
      available: true,
      totalConstituencies: tally.totalConstituencies,
      totalLeadingOrWon: tally.parties.reduce((acc, row) => acc + row.total, 0),
      parties: tally.parties.slice(0, 8),
    };
    sources.unshift({
      key: "official",
      name: "Election Commission (Official Tally)",
      url: RESULTS_PAGE_URL,
      status: "ok",
      itemCount: tally.parties.length,
      lastSync: new Date().toISOString(),
    });
  } catch (error: any) {
    const scraped = await scrapeOfficialTallyFromHtml();
    if (scraped && scraped.parties.length > 0) {
      official = {
        election: scraped.election,
        source: "result.election.gov.np (scraped)",
        available: true,
        totalConstituencies: scraped.totalConstituencies,
        totalLeadingOrWon: scraped.parties.reduce((acc, row) => acc + row.total, 0),
        parties: scraped.parties.slice(0, 8),
      };
      sources.unshift({
        key: "official",
        name: "Election Commission (Official Tally)",
        url: RESULTS_PAGE_URL,
        status: "ok",
        itemCount: scraped.parties.length,
        lastSync: new Date().toISOString(),
      });
    } else {
      sources.unshift({
        key: "official",
        name: "Election Commission (Official Tally)",
        url: RESULTS_PAGE_URL,
        status: "degraded",
        itemCount: 0,
        lastSync: new Date().toISOString(),
        error: error?.message || "Official tally unavailable",
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    official,
    explorer: {
      proportional,
      area,
    },
    sources,
    updates,
  };
}
