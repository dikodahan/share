export {};
const STAR_PARAMS: (keyof PlayerInfo)[] = ["ציון משוקלל"];
const NON_AUTO_DISPLAY_PARAMS: Set<keyof PlayerInfo> = new Set([
  ...STAR_PARAMS,
  "logo",
]);

Vue.component("players-table", {
  template: `
  <div>
      <h1 class="hebh1"><u>טבלת השוואת נגנים</u></h1>
        
      <br />
      <table>
          <thead class="title-case">
            <tr>
                <th>
                  <div class="flex-down">
                    <select class="dropdown" id="filter-dropdown" v-model="filter" style="margin-top: 0.5rem;">
                      <option :value="null">כל הנגנים</option>
                      <option v-for="value of filters" :value="value">{{ value }}</option>
                    </select>
                    <span>פרמטרים</span>
                  </div>
                </th>
                <th v-for="(player, name) in players" :key="name">
                  <div class="flex-down">
                    <span style="margin-top: 0.5rem;">{{ name }}</span>
                    <img :src="player.logo" :alt="name" width="50" height="50" />
                  </div>
                </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in starParams" :key="param">
                <th>{{ param }}</th>
                <td v-for="item in players">
                    {{ item[param] ? "⭐".repeat(item[param]) : "-" }}
                </td>
            </tr>
            <tr v-for="param in parameters">
                <th>{{ param }}</th>
                <td v-for="(player, name) in players">
                    <a v-if="String(player[param]).startsWith('http')" :href="player[param]" target="_blank">קישור</a>
                        <span v-else-if="typeof player[param] === 'boolean'">{{ player[param] ? '✅' : '🛑' }}</span>
                        <span v-else>{{ player[param] }}</span>
                </td>
            </tr>
          </tbody>
      </table>
  </div>
  `,
  data() {
    return {
      allPlayers: {} as Players,
      parameters: [] as (keyof PlayerInfo)[],
      filters: [
        "אנדרויד טיוי",
        "אנדרויד נייד",
        "אפל טיוי",
        "אפל נייד",
        "ווינדוס",
        "מאק",
      ] as (keyof PlayerInfo)[],
      filter: null as keyof PlayerInfo | null,
    };
  },
  async beforeMount() {
    const players = (await fetch("/comparison-players.json").then((res) =>
      res.json()
    )) as Players;
    this.allPlayers = players;
    this.parameters = [
      ...new Set(
        Object.entries(players)
          .flatMap(([, player]) => Object.keys(player))
          .filter((k) => !NON_AUTO_DISPLAY_PARAMS.has(k as keyof PlayerInfo))
      ),
    ] as (keyof PlayerInfo)[];
  },
  computed: {
    starParams() {
      return STAR_PARAMS;
    },
    players() {
      const filter = this.filter;
      if (!filter) return this.allPlayers;
      return Object.fromEntries(
        Object.entries(this.allPlayers).filter(([, player]) => !!player[filter])
      );
    },
  },
});
