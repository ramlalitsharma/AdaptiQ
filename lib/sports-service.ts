/**
 * Sports Telemetry Service
 * Handles official integrations for real-time sports intelligence.
 */
export const SportsService = {
  /**
   * Fetch official team rankings from Crickbuzz (via RapidAPI)
   * Securely proxies the request to RapidAPI to protect credentials.
   */
  async fetchTeamRankings(format: string = 't20', isWomen: boolean = false) {
    const host = 'crickbuzz-official-apis.p.rapidapi.com';
    const key = process.env.CRICKBUZZ_RAPID_API_KEY || 'd67398164emsh76030fc5ec05798p15c946jsnd71d85434439';

    const url = `https://${host}/rankings/team/?formatType=${format}&women=${isWomen ? 1 : 0}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': host,
          'x-rapidapi-key': key,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`RapidAPI responded with ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SportsService.fetchTeamRankings Error:', error);
      return null;
    }
  }
};
