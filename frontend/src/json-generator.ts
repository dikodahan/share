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
    groupTitle?: string;
    notWorking?: boolean;
}


Vue.component("json-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
        <h1 class="hebh1"><u>יצירת קובץ שירות עבור ספק חדש</u></h1>
        <br>

        <!-- First Question -->
        <p class="hebp">מה שם הספק (באנגלית) של הפלייליסט הזה?
            <input class="input-left-align" type="text" id="providerInput" v-model="providerName" />
        </p>

        <!-- Second Question: Appears after answering the first question -->
        <div v-if="providerName">
            <p class="hebp">האם כל ערוצי ישראל מהספק מופיעים בתוך קבוצה אחת בפלייליסט?
                <input type="radio" id="yes" value="YES" v-model="isSingleGroup">
                <label for="yes">כן</label>
                <input type="radio" id="no" value="NO" v-model="isSingleGroup">
                <label for="no">לא</label>
            </p>
        </div>

        <!-- Third Question: Appears after answering the second question -->
        <div v-if="isSingleGroup === 'YES'">
            <p class="hebp">אנא ספק את שם הקבוצה, בדיוק כפי שהיא מופיעה בנגן:
                <input class="input-left-align" type="text" v-model="groupName" />
            </p>
        </div>
        <div v-if="isSingleGroup === 'NO'">
            <p class="hebp">אנא ספק את הקידומת לכל ערוץ שמופיעה לכל ערוצי ישראל:
                <input class="input-left-align" type="text" v-model="channelPrefix" />
            </p>
        </div>

        <!-- File Picker: Appears after answering the third question -->
        <div v-if="(isSingleGroup === 'YES' && groupName) || (isSingleGroup === 'NO' && channelPrefix)">
            <p class="hebp">בחרו את קובץ הפלייליסט שקיבלתם מהספק שלכם:
                <input type="file" id="fileInput" @change="handleFileUpload" accept=".m3u,.m3u8" style="display: none;"/>
                <label for="fileInput" class="custom-file-upload">בחירת קובץ...</label>
            </p>
        </div>

        <div v-if="channels.length > 0">
        <table>
            <tr>
                <th>לוגו מקור</th>
                <th>שם מקור</th>
                <th>ערוץ בפועל</th>
                <th>לוגו בפועל</th>
                <th>ערוץ לא עובד</th>
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
                <td>
                    <input type="checkbox" v-model="channel.notWorking">
                </td>
            </tr>
        </table>
        <p class="hebp">הורידו את הקובץ המעודכן כדי לטעון אותו בנגן שלכם:
            <button v-if="modifiedFile && allChannelsMappedOrNotWorking" @click="downloadFile" class="custom-download-button">הורדת קובץ...</button><br>
        </p>
        <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
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
        providerName: '',
        isSingleGroup: '',
        groupName: '',
        channelPrefix: '',
    };
  },

  computed: {
    allChannelsMappedOrNotWorking() {
        return this.channels.every(channel => channel.selectedMapping || channel.notWorking);
    }
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
                console.log('Upload Progress:', this.uploadProgress); // Debugging line
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
        let channels: Channel[] = [];
        let currentGroup = '';
    
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTGRP:')) {
                currentGroup = lines[i].substring(8).trim().toLowerCase();
            }
    
            if (lines[i].startsWith('#EXTINF:')) {
                const metadata = lines[i];
                const url = lines[++i];
                // Extract the channel name after the last comma
                const name = metadata.substring(metadata.lastIndexOf(',') + 1).trim().toLowerCase();
                const groupTitleMatch = metadata.match(/group-title="([^"]+)"/i);
                let groupTitle = groupTitleMatch ? groupTitleMatch[1].toLowerCase() : currentGroup;
    
                let filterGroup = this.isSingleGroup === 'YES' ? this.groupName.toLowerCase() : this.channelPrefix.toLowerCase();
                if ((this.isSingleGroup === 'YES' && groupTitle.includes(filterGroup)) ||
                    (this.isSingleGroup === 'NO' && name.startsWith(filterGroup))) {
                    // Extract additional channel information as needed
                    const logoMatch = metadata.match(/tvg-logo="([^"]+)"/);
                    const logo = logoMatch ? logoMatch[1] : undefined;
                    const tvgIdMatch = metadata.match(/tvg-id="([^"]+)"/i);
                    const tvgId = tvgIdMatch ? tvgIdMatch[1] : undefined;
                    const tvgNameMatch = metadata.match(/tvg-name="([^"]+)"/i);
                    const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;
    
                    channels.push({ name, metadata, url, logo, tvgId, tvgName });
                }
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
        const filteredChannels = this.channels.filter(channel => !channel.notWorking);
        // Create a set of channel names from the uploaded playlist for easy lookup
        const processedChannelNames = new Set(this.channels.map(channel => channel.selectedMapping ? channel.selectedMapping.name || channel.name : channel.name));
    
        // Processed channels
        const updatedChannels = this.channels.map(channel => {
            return {
                channelName: channel.selectedMapping ? channel.selectedMapping.name || channel.name : channel.name,
                channelId: channel.tvgId || channel.tvgName || 'none'
            };
        });
    
        // Add missing channels from channelLineup
        Object.entries(this.channelLineup).forEach(([name, lineupChannel]) => {
            if (lineupChannel.link && !processedChannelNames.has(name)) {
                updatedChannels.push({
                    channelName: name,
                    channelId: 'none'
                });
            }
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