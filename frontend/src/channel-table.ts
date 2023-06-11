export {};
Vue.component("channel-table", {
  template: `
    <div class="fixTableHead">
        <table>
            <thead class="title-case">
                <tr>
                    <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
                    <th>שם ערוץ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="name in channelNames">
                    <td v-for="(service, serviceName) in services">
                    {{ service.includes(name) ? "✅" : "🛑" }}
                    </td>
                    <td>{{ name }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
  data() {
    return {
      services: {} as ChannelStats,
      comparison: [] as ComparisonService[],
    };
  },
  async beforeMount() {
    const [services, comparison] = await Promise.all([
      fetch("/service-channel-names.json").then((res) =>
        res.json()
      ) as Promise<ChannelStats>,
      fetch("/comparison-services.json").then((res) => res.json()) as Promise<
        ComparisonService[]
      >,
    ]);
    this.services = services;
    this.comparison = comparison;
  },
  methods: {
    getServiceName(service: string) {
      return (
        this.comparison.find((s) => s.service === service)?.name ?? service
      );
    },
  },
  computed: {
    channelNames() {
      return Array.from(
        new Set(Object.values(this.services).flatMap((channels) => channels))
      );
    },
  },
});
