export {};

Vue.component("playlist-generator", {
    template: `
  <div>
    <input type="file" @change="handleFileUpload" accept=".m3u,.m3u8"/>
    <button v-if="modifiedFile" @click="downloadFile">Download Modified File</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
  `,

  data() {
    return {
      modifiedFile: null as string | null,
      fileExtension: '' as string,
      errorMessage: ''
    };
  },

  methods: {
    handleFileUpload(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (!files) {
        this.errorMessage = 'No file selected.';
        return;
      }

      const file = files[0];
      if (!file.name.endsWith('.m3u') && !file.name.endsWith('.m3u8')) {
        this.errorMessage = 'Invalid file type. Please select a .m3u or .m3u8 file.';
        return;
      }

      this.fileExtension = file.name.endsWith('.m3u') ? '.m3u' : '.m3u8'; // Store the file extension

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            this.modifiedFile = this.processM3UFile(content);
            this.errorMessage = '';
          } catch (error) {
            this.errorMessage = 'Error processing file.';
            console.error(error);
          }
        }
      };
      reader.onerror = () => {
        this.errorMessage = 'Error reading file.';
      };
      reader.readAsText(file);
    },

    processM3UFile(content: string): string {
      // ... existing processing logic ...
    },

    downloadFile() {
      if (!this.modifiedFile) {
        this.errorMessage = 'No modified file to download.';
        return;
      }

      const blob = new Blob([this.modifiedFile], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'DikoPlus' + this.fileExtension; // Set the download file name with correct extension
      link.click();

      // Clean up
      URL.revokeObjectURL(link.href);
      this.modifiedFile = null;
    },
  },
});