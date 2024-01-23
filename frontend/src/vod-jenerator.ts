export {};

Vue.component("movie-player", {
    data() {
        return {
            // Data properties (if any are needed)
        };
    },

    methods: {
        async loadVideo(userUrl: string) {
            // Extract the code from the user URL
            const urlParams = new URLSearchParams(new URL(userUrl).search);
            const code = urlParams.get('code');
            if (!code) {
                console.error('Code parameter is missing in the URL');
                return;
            }

            // Fetch data from the API
            try {
                const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Process the API response
                const data = await response.json();
                const message = data.message;
                const videoUrl = message.split(',')[0].replace(/"/g, '');

                // Redirect to the m3u8 URL
                window.location.href = videoUrl;
            } catch (error) {
                console.error('Error fetching or processing data:', error);
            }
        }
    },

    mounted() {
        // Call loadVideo with the actual userUrl obtained from your application logic
        // Example: this.loadVideo('https://app.com/vod?code=12345');
    }
});