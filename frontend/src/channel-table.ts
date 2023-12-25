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
                  <th>לוגו ערוץ</th> <!-- Changed from שם ערוץ to לוגו ערוץ -->
                  <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="channelName in channelNames">
                  <td><img :src="getChannelLogo(channelName)" alt="Logo"></td> <!-- Use channel logos here -->
                  <td v-for="(service, serviceName) in services">
                  {{ hasChannel(service, channelName) ? "✅" : "🛑" }}
                  </td>
              </tr>
          </tbody>  
      </table>
  </div>
  `,
  // template: `
  //   <div class="fixTableHead">
  //       <h1 class="hebh1"><u>טבלת השוואת ערוצי ישראל לכל ספק</u></h1>
  //       <table>
  //           <thead class="title-case">
  //               <tr>
  //                   <th>שם ערוץ</th>
  //                   <th v-for="(service, name) in services">{{ getServiceName(name) }}</th>
  //               </tr>
  //           </thead>
  //           <tbody>
  //               <tr v-for="name in channelNames">
  //                   <td>{{ name }}</td>
  //                   <td v-for="(service, serviceName) in services">
  //                   {{ hasChannel(service, name) ? "✅" : "🛑" }}
  //                   </td>
  //               </tr>
  //           </tbody>  
  //       </table>
  //   </div>
  //   `,
  data() {
    return {
      services: {} as ChannelStats,
      comparison: [] as ComparisonService[],
      channelLineup: {} as Record<string, any>,
    };
  },
  async beforeMount() {
    const [servicesData, comparisonData, channelLineupData] = await Promise.all([
      fetch("/service-channel-names.json").then((res) => res.json()),
      fetch("/comparison-services.json").then((res) => res.json()),
      fetch("/channel-lineup.json").then((res) => res.json())
    ]);
    this.services = servicesData as ChannelStats;
    this.comparison = comparisonData as ComparisonService[];
    this.channelLineup = channelLineupData as Record<string, any>;
  },
  methods: {
    getServiceName(service: string) {
      return (
        this.comparison.find((s) => s.service === service)?.name ?? service
      );
    },
    hasChannel(serviceChannels: ChannelInfo[], channelName: string) {
      return serviceChannels.some((ci: ChannelInfo) => ci.channelName === channelName);
    },
    getChannelLogo(channelName: string) {
      return this.channelLineup[channelName]?.tvgLogo || 'https://raw.githubusercontent.com/dikodahan/dikodahan.github.io/master/creative/img/Categories/DikoPlus-icon.png';
    },
  },
  computed: {
    channelNames() {
      return Object.keys(this.channelLineup);
    },
  },
});