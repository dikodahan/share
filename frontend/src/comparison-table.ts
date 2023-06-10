export {};
const STAR_PARAMS: (keyof ComparisonService)[] = ["ציון"];
const NON_AUTO_DISPLAY_PARAMS: Set<keyof ComparisonService> = new Set([
  "name",
  "service",
  ...STAR_PARAMS,
]);

window.Vue.component("comparison-table", {
  template: `
        <div>
            <table>
                <thead class="title-case">
                    <tr>
                        <th v-for="service in serviceNames">{{ service }}</th>
                        <th>פרמטרים</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="param in starParams">
                        <td v-for="item in comparison">
                            {{ "⭐".repeat(item[param]) }}
                        </td>
                        <th>{{ param }}</th>
                    </tr>
                    <tr v-for="param in parameters">
                        <td v-for="item in comparison">
                            <a v-if="String(item[param]).startsWith('http')" :href="item[param]" target="_blank">קישור</a>
                            <span v-else-if="typeof item[param] === 'boolean'">{{ item[param] ? '✅' : '🛑' }}</span>
                            <span v-else>{{ item[param] }}</span>
                        </td>
                        <th>{{ param }}</th>
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
