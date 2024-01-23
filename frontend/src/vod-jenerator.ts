export {};

Vue.component("movie-player", {
    data() {
        return {
            // Data properties (if any are needed)
        };
    },

    methods: {
        async loadVideo(userUrl: string) {
            console.log("loadVideo called with URL:", userUrl); // Debugging message

            // Extract the code from the user URL
            try {
                const urlParams = new URLSearchParams(new URL(userUrl).search);
                const code = urlParams.get('code');
                console.log("Extracted code:", code); // Debugging message

                if (!code) {
                    console.error('Code parameter is missing in the URL');
                    return;
                }

                // Fetch data from the API
                const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;
                console.log("API URL constructed:", apiUrl); // Debugging message

                const response = await fetch(apiUrl);
                console.log("API response received:", response); // Debugging message

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Process the API response
                const data = await response.json();
                console.log("API response data:", data); // Debugging message

                const message = data.message;
                const videoUrl = message.split(',')[0].replace(/"/g, '');
                console.log("Extracted video URL:", videoUrl); // Debugging message

                // Redirect to the m3u8 URL
                window.location.href = videoUrl;
            } catch (error) {
                console.error('Error in loadVideo method:', error);
            }
        }
    },

    mounted() {
        // Replace this URL with the actual one you receive
        this.loadVideo('https://app.com/vod?code=12345');
        console.log("Component mounted"); // Debugging message
    }
});