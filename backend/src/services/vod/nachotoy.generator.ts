import axios from 'axios';

export async function nachotoyGenerator(userUrl: string): Promise<string> {
    try {
        const urlParams = new URLSearchParams(new URL(userUrl).search);
        const code = urlParams.get('code');

        if (!code) {
            console.error('Code parameter is missing in the URL');
            return 'Error: Code parameter is missing';
        }

        const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;
        const response = await axios.get(apiUrl);

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const message = response.data.message;
        const videoUrl = message.split(',')[0].replace(/"/g, '');

        // Fetch the content of the m3u8 file
        const m3u8Response = await axios.get(videoUrl);
        if (m3u8Response.status !== 200) {
            throw new Error(`Error fetching m3u8 content. Status: ${m3u8Response.status}`);
        }

        return m3u8Response.data; // Return the content of the m3u8 file
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
            return `Error: ${error.message}`;
        } else {
            console.error('An unexpected error occurred');
            return 'Error: An unexpected error occurred';
        }
    }
}