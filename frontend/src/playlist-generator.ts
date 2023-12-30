export {};

interface ComparisonService {
  service: string;
  name?: string;
  DikoPlus: string;
  updated?: string;
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

interface Channel {
  name: string;
  metadata: string;
  url: string;
  extgrp: string;
}


Vue.component("playlist-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
      <h1 class="hebh1"><u>עריכת קובץ פלייליסט ידני לשירות DikoPlus</u></h1>
      <p class="hebp">בעזרת התהליך הזה תוכלו להעלות את קובץ הפלייליסט שלכם עבור שירותים שלא תומכים בשירות DikoPlus כדי לייצר קובץ פלייליסט מעודכן שיאפשר תמיכה מלאה בכל שירותי השירות, למעט עדכון אוטומטי של הרשימה. חשוב לציין שאתם חייבים לספק קובץ מקור מהספק! המערכת אינה תומכת בקבצים שעברו שינוי מהמקור.</p>
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
      <p  class="hebp" v-if="selectedServiceUpdated" style="color: #32CD32; font-weight: bold;">תאריך עדכון אחרון: {{ selectedServiceUpdated }}</p>
      <br>
      <p class="hebp" v-if="selectedService">שלב ב׳: בחרו אם ברצונכם לוגואים ללא רקע, או על גבי רקע מושחר:
        <select v-model="mode" class="service-dropdown" style="padding-left: 20px;">
          <option value="light">ללא רקע</option>
          <option value="dark">על רקע מושחר</option>
        </select>
      </p>
      <br>
      <p class="hebp" v-if="selectedService">שלב ג׳: בחרו את קובץ הפלייליסט שקיבלתם מהספק שלכם:
        <input type="file" id="fileInput" @change="handleFileUpload" accept=".m3u,.m3u8" :disabled="!selectedService" style="display: none;"/>
        <label for="fileInput" class="custom-file-upload" :class="{'disabled-label': !selectedService}">בחירת קובץ...</label>
      </p>
      <br>
      <p class="hebp" v-if="selectedService">שלב ד׳: הורידו את הקובץ המעודכן כדי לטעון אותו בנגן שלכם:
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
      mode: 'light',
      selectedServiceUpdated: '',
    };
  },

  computed: {
    nonDikoPlusServices() {
      return this.comparisonServices.filter(service => service.DikoPlus === '📄');
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

  watch: {
    selectedService(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updateServiceDate();
      }
    }
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
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            this.modifiedFile = await this.processM3UFile(content);
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

    updateServiceDate() {
      const selectedServiceData = this.comparisonServices.find(service => service.service === this.selectedService);
      if (selectedServiceData && selectedServiceData.updated) {
        this.selectedServiceUpdated = this.formatDate(selectedServiceData.updated);
      } else {
        this.selectedServiceUpdated = '';
      }
    },
  
    formatDate(dateString: string) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formattedDate = new Date(dateString).toLocaleDateString('he-IL', dateOptions);
    
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      const formattedTime = new Date(dateString).toLocaleTimeString('en-US', timeOptions).toUpperCase();
    
      return `${formattedDate} בשעה ${formattedTime}`;
    },    

    async processM3UFile(content: string): Promise<string> {
      const lines = content.split(/\r?\n/);
    
      const serviceChannels: ServiceChannel[] = await fetch(`/${this.selectedService}.json`).then(res => res.json());
      const channelLineup: ChannelStats = await fetch('/channel-lineup.json').then(res => res.json());
    
      let channels: Channel[] = [];
      let currentChannel: Channel = { name: '', metadata: '', url: '', extgrp: '' };
      let channelOrder = Object.keys(channelLineup); // Used for sorting channels
    
      for (const line of lines) {
        if (line.startsWith('#EXTINF:')) {
          const tvgIdMatch = line.match(/tvg-id="([^"]+)"/);
          const tvgNameMatch = line.match(/tvg-name="([^"]+)"/);
          let channelId = tvgIdMatch && tvgIdMatch[1] ? tvgIdMatch[1] : (tvgNameMatch ? tvgNameMatch[1] : '');
      
          let serviceChannel = serviceChannels.find(c => c.channelId === channelId);
          if (!serviceChannel && tvgNameMatch) {
            serviceChannel = serviceChannels.find(c => c.channelId === tvgNameMatch[1]);
          }
      
          if (serviceChannel && channelLineup[serviceChannel.channelName]) {
            const lineupChannel = channelLineup[serviceChannel.channelName];
            const logoUrl = this.mode === 'dark' ? lineupChannel.tvgLogoDm : lineupChannel.tvgLogo;
      
            let modifiedLine = line;
            if (tvgIdMatch && tvgIdMatch[1]) {
              // If tvg-id is present and non-empty, replace it with the value from channelLineup
              modifiedLine = line.replace(/tvg-id="[^"]+"/, `tvg-id="${lineupChannel.tvgId}"`);
            } else if (tvgNameMatch) {
              // If tvg-id is empty or missing, replace tvg-name with the value from channelLineup
              modifiedLine = line.replace(/tvg-name="[^"]+"/, `tvg-name="${lineupChannel.tvgId}"`);
            }
      
            currentChannel = {
              name: serviceChannel.channelName,
              metadata: modifiedLine.replace(/tvg-logo="[^"]+"/, `tvg-logo="${logoUrl}"`)
                                    .replace(/,.*$/, `,${serviceChannel.channelName}`),
              url: '',
              extgrp: lineupChannel.extGrp ? `#EXTGRP:${lineupChannel.extGrp}` : ''
            };
          } else {
            currentChannel = { name: '', metadata: '', url: '', extgrp: '' };
          }
        } else if (line.startsWith('http') && currentChannel.name) {
          currentChannel.url = line;
          channels.push(currentChannel);
          currentChannel = { name: '', metadata: '', url: '', extgrp: '' };
        }
      }      
    
      // Add channels from the service JSON that were not in the playlist
      serviceChannels.forEach(serviceChannel => {
        if (!channels.some(channel => channel.name === serviceChannel.channelName)) {
          const lineupChannel = channelLineup[serviceChannel.channelName];
          if (lineupChannel) {
            const logoUrl = this.mode === 'dark' ? lineupChannel.tvgLogoDm : lineupChannel.tvgLogo;
            channels.push({
              name: serviceChannel.channelName,
              metadata: `#EXTINF:0 tvg-id="${lineupChannel.tvgId}" tvg-logo="${logoUrl}",${serviceChannel.channelName}`,
              url: lineupChannel.link,
              extgrp: lineupChannel.extGrp ? `#EXTGRP:${lineupChannel.extGrp}` : ''
            });
          }
        }
      });
    
      // Sort channels based on the order in channelLineup
      channels.sort((a, b) => channelOrder.indexOf(a.name) - channelOrder.indexOf(b.name));
    
      let outputLines = ['#EXTM3U', ''];
      channels.forEach(channel => {
        outputLines.push(channel.metadata, channel.extgrp, channel.url, '');
      });
    
      return Promise.resolve(outputLines.join('\n'));
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