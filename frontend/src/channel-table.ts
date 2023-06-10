Vue.component("channel-table", {
  template: `
    <div class="fixTableHead">
        <table>
            <thead class="title-case">
                <tr>
                    <th>Channel Name</th>
                    <th v-for="(service, name) in services">{{ name }}</th>
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
      services: {},
    };
  },
  async beforeMount() {
    const res = await fetch("/service-channel-names.json");
    const services = (await res.json()) as ChannelStats;
    this.services = services;
  },
  computed: {
    channelNames() {
      return Array.from(
        new Set(Object.values(this.services).flatMap((channels) => channels))
      );
    },
  },
});
