export {};
const STAR_PARAMS: (keyof ComparisonService)[] = ["ציון משוקלל","יציבות","איכות","תמיכה"];
const NON_AUTO_DISPLAY_PARAMS: Set<keyof ComparisonService> = new Set([
  "name",
  "service",
  ...STAR_PARAMS,
]);

Vue.component("comparison-table", {
  template: `
        <div>
            <h1 class="hebh1"><u>טבלת השוואת ספקים</u></h1>
            <table>
                <thead class="title-case">
                    <tr>
                        <th>פרמטרים</th>
                        <th v-for="service in serviceNames">{{ service }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="param in starParams">
                        <th>{{ param }}</th>
                        <td v-for="item in comparison">
                            {{ "⭐".repeat(item[param]) }}
                        </td>
                    </tr>
                    <tr v-for="param in parameters">
                        <th>{{ param }}</th>
                        <td v-for="item in comparison">
                            <a v-if="String(item[param]).startsWith('http')" :href="item[param]" target="_blank">קישור</a>
                            <span v-else-if="typeof item[param] === 'boolean'">{{ item[param] ? '✅' : '🛑' }}</span>
                            <span v-else-if="player[param] === '3'">3️⃣</span>
                            <span v-else>{{ item[param] }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
  data() {
    return {
      comparison: [] as ComparisonService[],
      parameters: [] as (keyof ComparisonService)[],
    };
  },
  async beforeMount() {
    const comparison = (await fetch("/comparison-services.json").then((res) =>
      res.json()
    )) as ComparisonService[];
    this.comparison = comparison;
    this.parameters = Array.from(
      new Set(comparison.flatMap((c) => Object.keys(c)))
    ).filter(
      (k) => !NON_AUTO_DISPLAY_PARAMS.has(k as keyof ComparisonService)
    ) as (keyof ComparisonService)[];
  },
  computed: {
    serviceNames() {
      return this.comparison.map((c) => c.name);
    },
    starParams() {
      return STAR_PARAMS;
    },
  },
});
