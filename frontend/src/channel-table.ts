export {};
Vue.component("channel-table", {
  template: `
    <div class="fixTableHead">
        <h1 class="hebh1"><u>טבלת השוואת ערוצי ישראל לכל ספק</u></h1>
        <table>
            <thead class="title-case">
                <tr>
                    <th>Logo</th>
                    <th>שם ערוץ</th>
                    <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="name in channelNames">
                    <td><img :src="getChannelLogo(name)" alt="Channel Logo" width="50"></td>
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
      lineup: [] as ChannelLineup[]
    };
  },
  async beforeMount() {
    const [services, comparison, lineup] = await Promise.all([
      fetch("/service-channel-names.json").then((res) =>
        res.json()
      ) as Promise<ChannelStats>,
      fetch("/comparison-services.json").then((res) => res.json()) as Promise<
        ComparisonService[]
      >,
      fetch("/backend/src/services/channel-lineup.json").then((res) => res.json()) as Promise<
        ChannelLineup[]
      >,
    ]);
    this.services = services;
    this.comparison = comparison;
    this.lineup = lineup;
  },
  methods: {
    getServiceName(service: string) {
      return (
        this.comparison.find((s) => s.service === service)?.name ?? service
      );
    },
    getChannelLogo(channelName: string) {
        return this.lineup.find(channel => channel.name === channelName)?.logo;
    }
  },
  computed: {
    channelNames() {
      return this.lineup.map(channel => channel.name);
    },
  },
});