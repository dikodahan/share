export {};

interface ChannelInfo {
  channelName: string;
  channelId: string | number;
}

interface ComparisonService {
  service: string;
  name?: string;
}

interface ChannelStats {
  [key: string]: ChannelInfo[];
}

Vue.component("channel-table", {
  template: `
    <div class="fixTableHead">
        <h1 class="hebh1"><u>טבלת השוואת ערוצי ישראל לכל ספק</u></h1>
        <table>
            <thead class="title-case">
                <tr>
                    <th>לוגו ערוץ</th>
                    <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="channelName in channelNames">
                    <td><img :src="getChannelLogo(channelName)" alt="Logo"></td>
                    <td v-for="(service, serviceName) in services">
                    {{ hasChannel(service, channelName) }}
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
      channelLineup: {} as Record<string, any>,
      freeChannels: [] as string[],
    };
  },
  async beforeMount() {
    const [services, comparison, channelLineup, freeData] = await Promise.all([
      fetch("/service-channel-names.json").then((res) => res.json()) as Promise<ChannelStats>,
      fetch("/comparison-services.json").then((res) => res.json()) as Promise<ComparisonService[]>,
      fetch("/channel-lineup.json").then((res) => res.json()) as Promise<Record<string, any>>,
      fetch("/free.json").then((res) => res.json()) as Promise<{ channelName: string }[]>
    ]);
    this.services = services;
    this.comparison = comparison;
    this.channelLineup = channelLineup;
    this.freeChannels = freeData.map((channel: { channelName: string }) => channel.channelName);
  },
  methods: {
    getServiceName(service: string) {
      return this.comparison.find((s) => s.service === service)?.name ?? service;
    },
    getChannelLogo(channelName: string) {
      return this.channelLineup[channelName]?.tvgLogo || 'https://raw.githubusercontent.com/dikodahan/dikodahan.github.io/master/creative/img/Categories/DikoPlus-icon.png';
    },
    hasChannel(serviceChannels: ChannelInfo[], channelName: string) {
      const isInService = serviceChannels.some((ci) => ci.channelName === channelName);
      const isInFree = this.freeChannels.includes(channelName);
  
      if (isInService) {
        // If the channel exists in the service file, always mark as "✅"
        return "✅";
      } else if (isInFree) {
        // If the channel is not in the service file but in the free file, mark as "🆓"
        return "🆓";
      } else {
        // If the channel is in neither file, mark as "🛑"
        return "🛑";
      }
    },
    /* hasChannel(serviceChannels: ChannelInfo[], channelName: string) {
      const channelInfo = serviceChannels.find((ci: ChannelInfo) => ci.channelName === channelName);
      if (channelInfo) {
        return channelInfo.channelId === 'none' || channelInfo.channelId === 1010 ? "🆓" : "✅";
      }
      return "🛑";
    }, */
  },
  computed: {
    channelNames() {
      return Object.keys(this.channelLineup);
    },
  },
});