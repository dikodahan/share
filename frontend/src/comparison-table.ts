const nonDisplayParams: Set<keyof ComparisonService> = new Set([
  "name",
  "service",
]);

Vue.component("comparison-table", {
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
      (k) => !nonDisplayParams.has(k as keyof ComparisonService)
    ) as (keyof ComparisonService)[];
  },
  computed: {
    serviceNames() {
      return this.comparison.map((c) => c.name);
    },
  },
});
