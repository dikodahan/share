export {};

interface LineupChannel {
    tvgId: string;
    tvgLogo: string;
    tvgLogoDm: string;
    extGrp: string;
    epgLink: string;
    link: string;
    name?: string;
}

interface Channel {
    name: string;
    metadata: string;
    url: string;
    logo?: string | null;
    selectedMapping?: LineupChannel;
    tvgId?: string;
    tvgName?: string;
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
        <div v-if="uploadProgress > 0 && uploadProgress < 100">
            <progress :value="uploadProgress" max="100"></progress> {{ uploadProgress }}%
        </div>
      <br>
      <table>
        <tr>
            <th>לוגו מקור</th>
            <th>שם מקור</th>
            <th>ערוץ בפועל</th>
            <th>לוגו בפועל</th>
        </tr>
        <tr v-for="channel in channels" :key="channel.name">
            <td><img :src="channel.logo" alt="Channel Logo"/></td>
            <td>{{ channel.name }}</td>
            <td>
                <!-- Standard HTML Dropdown for mapping -->
                <select v-model="channel.selectedMapping" class="service-dropdown">
                    <option disabled value="">בחר ערוץ...</option>
                    <option v-for="lineupChannel in channelLineupOptions" :value="lineupChannel">
                        {{ lineupChannel.name }}
                    </option>
                </select>       
            </td>
            <td>
                <!-- Display logo from selectedMapping -->
                <a v-if="channel.selectedMapping && channel.selectedMapping.epgLink" :href="channel.selectedMapping.epgLink" target="_blank">
                    <img :src="channel.selectedMapping.tvgLogo" alt="Selected Channel Logo"/>
                </a>
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
        uploadProgress: 0,
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
        this.uploadProgress = 0; // Reset progress
    
        const reader = new FileReader();
        
        // Monitor progress
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentLoaded = Math.round((event.loaded / event.total) * 100);
                this.uploadProgress = percentLoaded;
            }
        };
    
        reader.onloadstart = () => {
            this.uploadProgress = 0;
        };
    
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                try {
                    this.originalContent = content; // Store the original content
                    this.channels = await this.processM3UFile(content);
                    this.errorMessage = '';
                    this.modifiedFile = content; // Initially set modifiedFile to the original content
                    this.uploadProgress = 100; // Mark as complete
                } catch (error) {
                    this.errorMessage = 'שגיאה בעריכת הקובץ.';
                    console.error(error);
                    this.uploadProgress = 0; // Reset progress on error
                }
            }
        };
    
        reader.onerror = () => {
            this.errorMessage = 'שגיאה בקריאת הקובץ.';
            this.uploadProgress = 0; // Reset progress on error
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
                const tvgIdMatch = metadata.match(/tvg-id="([^"]+)"/i); // Case-insensitive match
                const tvgId = tvgIdMatch ? tvgIdMatch[1] : '';
                const tvgNameMatch = metadata.match(/tvg-name="([^"]+)"/i); // Case-insensitive match
                const tvgName = tvgNameMatch ? tvgNameMatch[1] : '';
                channels.push({ name, metadata, url, logo, tvgId, tvgName });
            }
        }
        return channels;
    },
    
    getChannelLineupOptions() {
        return Object.entries(this.channelLineup).map(([name, details]) => {
            return {
                name: name, // Channel name as key
                ...details // Spread the rest of the details
            };
        });
    },
    
    updatePlaylistContent() {
        const updatedChannels = this.channels.map(channel => {
            const channelId = channel.tvgId || channel.tvgName; // Fallback to tvg-name if tvg-id is empty
            return {
                channelName: channel.selectedMapping ? channel.selectedMapping.name || channel.name : channel.name,
                channelId: channelId
            };
        });
    
        return JSON.stringify(updatedChannels, null, 2); // Pretty print the JSON
    },

    downloadFile() {
        this.modifiedFile = this.updatePlaylistContent();
        if (!this.modifiedFile) {
            this.errorMessage = 'אין קובץ מתוקן להורדה.';
            return;
        }
    
        const blob = new Blob([this.modifiedFile], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'DikoPlus.json'; // Change to .json extension
        link.click();
    
        URL.revokeObjectURL(link.href);
        this.modifiedFile = null;
    },
  },
});