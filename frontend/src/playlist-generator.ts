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
  [key: string]: ChannelInfo[];
}

Vue.component("playlist-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
    <h1 class="hebh1"><u>עריכת קובץ פלייליסט ידני לשירות DikoPlus</u></h1>
    <p class="hebp">בעזרת התהליך הזה תוכלו להעלות את קובץ הפלייליסט שלכם עבור שירותי שלא תומכים בשירות DikoPlus כדי לייצר קובץ פלייליסט מעודכן שיאפשר תמיכה מלאה בכל שירותי השירות, למעט עדכון אוטומטי של הרשימה.</p>
    <p class="hebp">שימו לב לתאריך העדכון האחרון של הספק הנבחר כדי לבדוק אם אתם צריכים לייצר קובץ מעודכן עבור השירות שלכם. אין אפשרות לעדכון אוטומטי בשירותים שמוגדרים כאן, ולכן עדכון ידני יצטרך להתבצע על ידיכם.</p>
    <br><br>
    <p class="hebp">בחרו את הספק עבורו אם רוצים לייצר קובץ מעודכן:
      <select v-model="selectedService" class="service-dropdown" style="padding-right: 20px;">
        <option disabled value="">בחר שירות...</option>
        <option v-for="service in nonDikoPlusServices" :value="service.service">
          {{ service.name }}
        </option>
      </select>
    </p>
    <br>
    <input type="file" id="fileInput" @change="handleFileUpload" accept=".m3u,.m3u8" :disabled="!selectedService" style="display: none;"/>
    <label for="fileInput" class="custom-file-upload" :class="{'disabled-label': !selectedService}">בחר את קובץ הפלייליסט שלך</label><br><br>
    <button v-if="modifiedFile" @click="downloadFile" class="custom-download-button">הורד את קובץ הפלייליסט המתוקן</button><br>
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
    handleFileUpload(event: Event) {
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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            this.modifiedFile = this.processM3UFile(content);
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

    processM3UFile(content: string): string {
        const lines = content.split(/\r?\n/);
        let shouldModify = false;
  
        const modifiedLines = lines.map(line => {
          if (line.startsWith('#EXTGRP:1. Israel')) {
            shouldModify = true;
            return line;
          } else if (line.startsWith('#EXTGRP:') || line.startsWith('#EXTINF:')) {
            shouldModify = false;
          }
  
          if (shouldModify) {
            return line.replace(/3/g, '8');
          } else {
            return line;
          }
        });
  
        return modifiedLines.join('\n');
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
