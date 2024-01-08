import { Channel, ChannelData, LineupChannel, LineupOption } from "../../shared/types/channel-data";
import { MappingSubmitRequest } from "../../shared/types/mapping-submit-request";

export {};

function formatKeyName(key: string) {
  return key
    .split("-")
    .map((part: string, index: number) => {
      return index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

Vue.component("json-generator", {
  template: `
    <div class="fixTableHead" style="padding-left: 20px; padding-right: 20px;">
        <h1 class="hebh1"><u>יצירת קובץ שירות עבור ספק חדש</u></h1>
        <br>

        <!-- First Question -->
        <p class="hebp">מה שם הספק (באנגלית) של הפלייליסט הזה?
        <input type="text" id="providerInput" v-model="providerName" @input="setTextInputDirection" />
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
            <p class="hebp">אנא ספק את שם הקבוצה, או חלק ממנה, כפי שהיא מופיעה בנגן:
                <input type="text" v-model="groupName" @input="setTextInputDirection" />
            </p>
        </div>
        <div v-if="isSingleGroup === 'NO'">
            <p class="hebp">אנא ספק את הקידומת לכל ערוץ שמופיעה לכל ערוצי ישראל:
                <input type="text" v-model="channelPrefix" @input="setTextInputDirection" />
            </p>
        </div>

        <!-- File Picker: Appears after answering the third question -->
        <div v-if="(isSingleGroup === 'YES' && groupName) || (isSingleGroup === 'NO' && channelPrefix)">
            <p class="hebp">בחרו את קובץ הפלייליסט שקיבלתם מהספק שלכם:
                <input type="file" id="fileInput" @change="handleFileLoad" accept=".m3u,.m3u8" style="display: none;"/>
                <label for="fileInput" class="custom-file-upload">בחירת קובץ...</label>
            </p>
        </div>

        <div v-if="channels.length > 0">
            <div class="collapsible-header" @click="toggleAdvancedOptions">
            <span :class="{'collapsed': !showAdvancedOptions, 'expanded': showAdvancedOptions}">&#9660;</span>
                אפשרויות מתקדמות
            </div>
            <div v-show="showAdvancedOptions">
                <ul>
                    <li v-for="tag in metadataTags" :key="tag">
                        <input type="checkbox" :id="tag" :value="tag" v-model="selectedTags">
                        <label :for="tag">{{ tag }}</label>
                    </li>
                </ul>
            </div>
            <br>
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
                    <div class="dropdown">
                      <input type="text" v-model="dropdownFilter" placeholder="Type to filter...">
                      <ul v-if="dropdownFilter">
                        <li v-for="option in filteredChannelLineupOptions" :key="option.name" @click="selectChannel(option)">
                          {{ option.name }}
                        </li>
                      </ul>
                    </div>      
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
          <div v-if="channels.length && allChannelsMappedOrNotWorking">
            <p class="hebp">לחצו כאן על מנת להשלוח את בקשת ההוספה של הספק למפתחים:
                <button v-if="channels.length && allChannelsMappedOrNotWorking" @click="submitFile" class="custom-download-button">הגשת בקשה</button><br>
            </p>
            <p v-if="errorMessage">{{ errorMessage }}</p>
          </div>
        </div>
    </div>
  `,

  data() {
    return {
      //   modifiedFile: null as string | null,
      fileExtension: "" as string,
      errorMessage: "",
      channelLineup: {} as Record<string, any>,
      channels: [] as Channel[],
      channelLineupOptions: [] as LineupOption[],
      originalContent: "" as string,
      uploadProgress: 0,
      providerName: "",
      isSingleGroup: "",
      groupName: "",
      channelPrefix: "",
      showAdvancedOptions: false,
      metadataTags: [] as string[],
      selectedTags: [] as string[],
      dropdownFilter: '',
      selectedChannel: null as LineupOption | null,
    };
  },

  computed: {
    allChannelsMappedOrNotWorking() {
      return this.channels.every(
        (channel) => channel.selectedMapping || channel.notWorking
      );
    },

    filteredChannelLineupOptions(): LineupOption[] {
      if (!this.dropdownFilter) {
        return this.channelLineupOptions;
      }
      const filterLowerCase = this.dropdownFilter.toLowerCase();
      return this.channelLineupOptions.filter(option =>
        option.name.toLowerCase().includes(filterLowerCase)
      );
    },
  },

  async beforeMount() {
    try {
      const channelLineup = await fetch("/channel-lineup.json").then((res) =>
        res.json()
      );
      this.channelLineup = channelLineup;
      this.channelLineupOptions = this.getChannelLineupOptions();
    } catch (error) {
      console.error("Error fetching channel lineup:", error);
      // Handle error appropriately
    }
  },

  methods: {
    setTextInputDirection(event: InputEvent) {
      const hebrewCharRange = /[\u0590-\u05FF]/;
      const inputElement = event.target as HTMLInputElement; // Typecast to HTMLInputElement
      const inputText = inputElement.value;

      if (hebrewCharRange.test(inputText)) {
        inputElement.style.direction = "rtl";
      } else {
        inputElement.style.direction = "ltr";
      }
    },

    async handleFileLoad(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (!files) {
        this.errorMessage = "לא נבחר קובץ.";
        return;
      }

      const file = files[0];
      if (!file.name.endsWith(".m3u") && !file.name.endsWith(".m3u8")) {
        this.errorMessage = "קובץ לא תקין. רק קבצי m3u ו-m3u8 נתמכים";
        return;
      }

      this.fileExtension = file.name.endsWith(".m3u") ? ".m3u" : ".m3u8";
      this.uploadProgress = 0; // Reset progress

      const reader = new FileReader();

      // Monitor progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress = percentLoaded;
          console.log("Upload Progress:", this.uploadProgress); // Debugging line
        }
      };

      reader.onloadstart = () => {
        this.uploadProgress = 0;
      };

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          try {
            this.originalContent = content; // Store the original content
            this.channels = await this.processM3UFile(content);
            this.errorMessage = "";
            // this.modifiedFile = content; // Initially set modifiedFile to the original content
            this.uploadProgress = 100; // Mark as complete
          } catch (error) {
            this.errorMessage = "שגיאה בעריכת הקובץ.";
            console.error(error);
            this.uploadProgress = 0; // Reset progress on error
          }
        }
      };

      reader.onerror = () => {
        this.errorMessage = "שגיאה בקריאת הקובץ.";
        this.uploadProgress = 0; // Reset progress on error
      };

      reader.readAsText(file);
    },

    selectChannel(option: LineupOption) {
      this.selectedChannel = option;
      this.dropdownFilter = option.name;
    },

    async processM3UFile(content: string): Promise<Channel[]> {
      const lines = content.split("\n");
      let channels: Channel[] = [];
      let currentGroup = "";
      let metadataTagsSet = new Set(); // To store unique metadata tags

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTGRP:")) {
          currentGroup = lines[i].substring(8).trim().toLowerCase();
        }

        if (lines[i].startsWith("#EXTINF:")) {
          const metadata = lines[i];
          const url = lines[++i];
          // Extract the channel name after the last comma
          const name = metadata
            .substring(metadata.lastIndexOf(",") + 1)
            .trim()
            .toLowerCase();
          const groupTitleMatch = metadata.match(/group-title="([^"]+)"/i);
          let groupTitle = groupTitleMatch
            ? groupTitleMatch[1].toLowerCase()
            : currentGroup;

          let filterGroup =
            this.isSingleGroup === "YES"
              ? this.groupName.toLowerCase()
              : this.channelPrefix.toLowerCase();
          if (
            (this.isSingleGroup === "YES" &&
              groupTitle.includes(filterGroup)) ||
            (this.isSingleGroup === "NO" && name.startsWith(filterGroup))
          ) {
            // Extract additional channel information as needed
            const logoMatch = metadata.match(/tvg-logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : undefined;
            const tvgIdMatch = metadata.match(/tvg-id="([^"]+)"/i);
            const tvgId = tvgIdMatch ? tvgIdMatch[1] : undefined;
            const tvgNameMatch = metadata.match(/tvg-name="([^"]+)"/i);
            const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;

            channels.push({ name, metadata, url, logo, tvgId, tvgName });
          }

          // Extract all tags from the line for Advanced options
          const tagRegex = /([a-zA-Z0-9-]+)="[^"]*"/g;
          let match;
          while ((match = tagRegex.exec(metadata)) !== null) {
            if (
              !["tvg-id", "tvg-logo", "group-title"].includes(
                match[1].toLowerCase()
              )
            ) {
              metadataTagsSet.add(match[1]);
            }
          }
        }
      }

      this.metadataTags = Array.from(metadataTagsSet) as string[]; // Convert Set to Array and assert type
      return channels;
    },

    getChannelLineupOptions(): any[] {
      return Object.entries(this.channelLineup).map(([name, details]) => {
        return {
          name: name, // Channel name as key
          ...details as LineupChannel, // Spread the rest of the details
        };
      });
    },

    updatePlaylistContent(): ChannelData[] {
      const filteredChannels = this.channels.filter(
        (channel) => !channel.notWorking
      );

      // Processed channels with additional properties
      const updatedChannels = filteredChannels.map((channel) => {
        const channelData: ChannelData = {
          channelName: channel.selectedMapping
            ? channel.selectedMapping.name || channel.name
            : channel.name,
          channelId: channel.tvgId || channel.tvgName || "none",
          // Initialize additional properties here
        };

        this.selectedTags.forEach((tag) => {
          const regex = new RegExp(`${tag}="([^"]+)"`, "i");
          const match = channel.metadata.match(regex);
          if (match) {
            const formattedKey = formatKeyName(tag);
            channelData[formattedKey] = match[1];
          } else {
            // Default value for non-existing tags
            const formattedKey = formatKeyName(tag);
            channelData[formattedKey] = "0";
          }
        });

        return channelData;
      });

      return updatedChannels;
    },

    async submitFile() {
      try {
        const channels = this.updatePlaylistContent();
        const body: MappingSubmitRequest = {
          channels,
          description: "some description",
          serviceName: this.providerName,
        };

        const res = await fetch(
          `/services/${encodeURIComponent(this.providerName)}/submit`,
          {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(
            `failed to submit file: ${res.status} ${res.statusText}`
          );
        }
        console.debug(res.status, res.statusText, await res.text());
      } catch (e) {
        console.error(e);
      }
    },

    toggleAdvancedOptions() {
      this.showAdvancedOptions = !this.showAdvancedOptions;
    },
  },
});
