export {};

interface ChannelInfo {
  channelName: string;
  channelId: string | number;
}

interface ComparisonService {
  service: string;
  name?: string;
  DikoPlus: boolean; // Added field
}

interface ChannelStats {
  [key: string]: LineupChannel;
}

interface ServiceChannel {
  channelId: string;
  channelName: string;
}

interface LineupChannel {
  tvgId: string;
  tvgLogo: string;
  tvgLogoDm: string;
  extGrp: string;
  link: string;
}


Vue.component("playlist-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
    <h1 class="hebh1"><u>עריכת קובץ פלייליסט ידני לשירות DikoPlus</u></h1>
    <p class="hebp">בעזרת התהליך הזה תוכלו להעלות את קובץ הפלייליסט שלכם עבור שירותי שלא תומכים בשירות DikoPlus כדי לייצר קובץ פלייליסט מעודכן שיאפשר תמיכה מלאה בכל שירותי השירות, למעט עדכון אוטומטי של הרשימה.</p>
    <p class="hebp">שימו לב לתאריך העדכון האחרון של הספק הנבחר כדי לבדוק אם אתם צריכים לייצר קובץ מעודכן עבור השירות שלכם. אין אפשרות לעדכון אוטומטי בשירותים שמוגדרים כאן, ולכן עדכון ידני יצטרך להתבצע על ידיכם.</p>
    <br><br>
    <p class="hebp">שלב א׳: בחרו את הספק עבורו אם רוצים לייצר קובץ מעודכן:
      <select v-model="selectedService" class="service-dropdown" style="padding-left: 20px;">
        <option disabled value="">בחר שירות...</option>
        <option v-for="service in nonDikoPlusServices" :value="service.service">
          {{ service.name }}
        </option>
      </select>
    </p>
    <br>
    <p class="hebp">שלב ב׳: בחרו את קובץ הפלייליסט שקיבלתם מהספק שלכם:
      <input type="file" id="fileInput" @change="handleFileUpload" accept=".m3u,.m3u8" :disabled="!selectedService" style="display: none;"/>
      <label for="fileInput" class="custom-file-upload" :class="{'disabled-label': !selectedService}">בחירת קובץ...</label>
    </p>
    <br>
    <p class="hebp">שלב ג׳: הורידו את הקובץ המעודכן כדי לטעון אותו בנגן שלכם:
      <button v-if="modifiedFile" @click="downloadFile" class="custom-download-button">הורדת קובץ...</button><br>
    </p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
  `,

  data() {
    return {
      modifiedFile: null as string | null,
      fileExtension: '' as string,
      errorMessage: '',
      services: {} as ChannelStats,
      channelLineup: {} as Record<string, any>,
      comparisonServices: [] as ComparisonService[],
      selectedService: '' as string,
    };
  },

  computed: {
    nonDikoPlusServices() {
      return this.comparisonServices.filter(service => !service.DikoPlus);
    },
  },

  async beforeMount() {
    const [services, comparisonServices, channelLineup] = await Promise.all([
      fetch("/service-channel-names.json").then((res) => res.json()) as Promise<ChannelStats>,
      fetch("/comparison-services.json").then((res) => res.json()) as Promise<ComparisonService[]>,
      fetch("/channel-lineup.json").then((res) => res.json()) as Promise<Record<string, any>>,
    ]);
    this.services = services;
    this.comparisonServices = comparisonServices;
    this.channelLineup = channelLineup;
  },

  methods: {
    async handleFileUpload(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (!files) {
        this.errorMessage = 'לא נבחר קובץ.';
        return;
      }
  
      const file = files[0];
      if (!file.name.endsWith('.m3u') && !file.name.endsWith('.m3u8')) {
        this.errorMessage = 'קובץ לא תקין. רק קבצי m3u ו-m3u8 נתמכים';
        return;
      }
  
      this.fileExtension = file.name.endsWith('.m3u') ? '.m3u' : '.m3u8';
  
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {  // Marked as async
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            this.modifiedFile = await this.processM3UFile(content);  // Await the promise
            this.errorMessage = '';
          } catch (error) {
            this.errorMessage = 'שגיאה בעריכת הקובץ.';
            console.error(error);
          }
        }
      };
      reader.onerror = () => {
        this.errorMessage = 'שגיאה בקריאת הקובץ.';
      };
      reader.readAsText(file);
    },

    async processM3UFile(content: string): Promise<string> {
      const lines = content.split(/\r?\n/);
    
      const serviceChannels: ServiceChannel[] = await fetch(`/${this.selectedService}.json`).then(res => res.json());
      const channelLineup: ChannelStats = await fetch('/channel-lineup.json').then(res => res.json());
    
      return lines.map(line => {
        // 1. Replace the line that starts with "#EXTM3U"
        if (line.startsWith('#EXTM3U')) {
          return '#EXTM3U url-tvg="https://github.com/dikodahan/share02/raw/main/src/DikoPlusEPG.xml.gz"';
        }
    
        // 2, 3, 4, 5. Match channels and replace tvg-id and tvg-logo
        if (line.startsWith('#EXTINF:')) {
          const tvgIdMatch = line.match(/tvg-id="([^"]+)"/);
          if (tvgIdMatch) {
            const originalTvgId = tvgIdMatch[1];
            const serviceChannel = serviceChannels.find(c => c.channelId === originalTvgId);
            if (serviceChannel) {
              const lineupChannel = channelLineup[serviceChannel.channelName];
              if (lineupChannel) {
                line = line.replace(`tvg-id="${originalTvgId}"`, `tvg-id="${lineupChannel.tvgId}"`)
                           .replace(/tvg-logo="[^"]+"/, `tvg-logo="${lineupChannel.tvgLogo}"`);
              }
            }
          }
        }
    
        // 6. Remove tvg-group
        line = line.replace(/tvg-group="[^"]+"/, '');
    
        // 7, 8. Replace channel name and EXTGRP
        if (line.startsWith('#EXTGRP:')) {
          const channelNameMatch = line.match(/#EXTGRP:(.+)/);
          if (channelNameMatch) {
            const originalGroupName = channelNameMatch[1];
            const lineupChannel = Object.values(channelLineup).find(c => c.extGrp === originalGroupName);
            if (lineupChannel) {
              line = `#EXTGRP:${lineupChannel.extGrp}`;
            }
          }
        }
    
        // 9. Leave the actual URL intact
        // 10. Do not remove any other metadata
        return line;
      }).join('\n');
    },
    

    downloadFile() {
      if (!this.modifiedFile) {
        this.errorMessage = 'אין קובץ מתוקן להורדה.';
        return;
      }

      const blob = new Blob([this.modifiedFile], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'DikoPlus' + this.fileExtension;
      link.click();

      URL.revokeObjectURL(link.href);
      this.modifiedFile = null;
    },
  },
});
