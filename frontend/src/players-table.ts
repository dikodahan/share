export {};
const STAR_PARAMS: (keyof PlayerInfo)[] = ["ציון"];
const NON_AUTO_DISPLAY_PARAMS: Set<keyof PlayerInfo> = new Set([
  ...STAR_PARAMS,
]);

Vue.component("players-table", {
  template: `
  <div>
      <table>
          <thead class="title-case">
            <tr>
                <th v-for="(player, name) in players">{{ name }}</th>
                <th>פרמטרים</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in starParams">
                <td v-for="item in players">
                    {{ item[param] ? "⭐".repeat(item[param]) : "-" }}
                </td>
                <th>{{ param }}</th>
            </tr>
            <tr v-for="param in parameters">
                <td v-for="(player, name) in players">
                    <a v-if="String(player[param]).startsWith('http')" :href="player[param]" target="_blank">קישור</a>
                        <span v-else-if="typeof player[param] === 'boolean'">{{ player[param] ? '✅' : '🛑' }}</span>
                        <span v-else>{{ player[param] }}</span>
                </td>
                <th>{{ param }}</th>
            </tr>
          </tbody>
      </table>
  </div>
  `,
  data() {
    return {
      players: {} as Players,
      parameters: [] as (keyof PlayerInfo)[],
    };
  },
  async beforeMount() {
    const players = (await fetch("/comparison-players.json").then((res) =>
      res.json()
    )) as Players;
    this.players = players;
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
  },
});
