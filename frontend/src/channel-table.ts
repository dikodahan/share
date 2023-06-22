export {};
Vue.component("channel-table", {
  template: `
    <div class="fixTableHead">
        <h1 class="hebh1"><u>טבלת השוואת ערוצי ישראל לכל ספק (בבניה מחדש)</u></h1>
        <table>
            <thead class="title-case">
                <tr>
                    <th>שם ערוץ</th>
                    <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="name in channelNames">
                    <td>{{ name }}</td>
                    <td v-for="(service, serviceName) in services">
                    {{ service.includes(name) ? "✅" : "🛑" }}
                    </td>
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
