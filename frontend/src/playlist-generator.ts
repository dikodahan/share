export {};

Vue.component("playlist-generator", {
    template: `
  <div>
    <input type="file" @change="handleFileUpload" accept=".m3u"/>
    <button v-if="modifiedFile" @click="downloadFile">Download Modified File</button>
  </div>
  `,

  methods: {
    handleFileUpload(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          this.modifiedFile = this.processM3UFile(content);
        }
      };
      reader.readAsText(files[0]);
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
      if (!this.modifiedFile) return;

      const blob = new Blob([this.modifiedFile], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'modified_playlist.m3u';
      link.click();

      // Clean up
      URL.revokeObjectURL(link.href);
      this.modifiedFile = null;
    },
  },
});