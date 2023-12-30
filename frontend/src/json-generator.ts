export {};

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
    logo?: string | null;
    selectedMapping?: Channel;
}


Vue.component("json-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
      <h1 class="hebh1"><u>יצירת קובץ שירות עבור ספק חדש</u></h1>
      <br>
      <br>
      <p class="hebp">בחרו את קובץ הפלייליסט שקיבלתם מהספק שלכם:
        <input type="file" id="fileInput" @change="handleFileUpload" accept=".m3u,.m3u8" style="display: none;"/>
        <label for="fileInput" class="custom-file-upload">בחירת קובץ...</label>
      </p>
      <br>
      <table>
        <tr>
            <th>לוגו מקור</th>
            <th>שם מקור</th>
            <th>ערוץ בפועל</th>
        </tr>
        <tr v-for="channel in channels" :key="channel.name">
            <td><img :src="channel.logo" alt="Channel Logo"/></td>
            <td>{{ channel.name }}</td>
            <td>
            <!-- Dropdown for mapping -->
            <v-select :options="channelLineupOptions" v-model="channel.selectedMapping"></v-select>
            </td>
        </tr>
      </table>
      <p class="hebp">הורידו את הקובץ המעודכן כדי לטעון אותו בנגן שלכם:
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
        channelLineup: {} as Record<string, any>,
        channels: [] as Channel[],
        channelLineupOptions: [] as { label: string; value: LineupChannel }[],
        originalContent: '' as string,
    };
  },

  computed: {
    
  },

  async beforeMount() {
    try {
      const channelLineup = await fetch("/channel-lineup.json").then((res) => res.json());
      this.channelLineup = channelLineup;
      this.channelLineupOptions = this.getChannelLineupOptions();
    } catch (error) {
      console.error('Error fetching channel lineup:', error);
      // Handle error appropriately
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
                    // Process the M3U file and update the channels data property
                    this.channels = await this.processM3UFile(content);
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

    async processM3UFile(content: string): Promise<Channel[]> {
        const lines = content.split('\n');
        const channels = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
            const metadata = lines[i];
            const url = lines[++i]; // URL follows metadata line
            const name = metadata.split(',')[1];
            const logoMatch = metadata.match(/tvg-logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : null;
            channels.push({ name, metadata, url, logo });
            }
        }
        return channels;
    },
    
    getChannelLineupOptions() {
        // Convert channelLineup to dropdown options
        return Object.values(this.channelLineup).map(channel => ({
          label: channel.name, // Assuming 'name' is a property in channelLineup
          value: channel
        }));
    },
    
    updatePlaylistContent() {
        let updatedContent = this.originalContent;
        this.channels.forEach(channel => {
          if (channel.selectedMapping) {
            // Replace channel name in the content
            updatedContent = updatedContent.replace(channel.name, channel.selectedMapping.name);
          }
        });
        return updatedContent;
    },

    downloadFile() {
        this.modifiedFile = this.updatePlaylistContent();
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
