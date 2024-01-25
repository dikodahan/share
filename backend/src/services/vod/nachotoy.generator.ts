import axios from 'axios';
import { getImdbId, fetchSubtitlesUrl } from './subs'; // Importing functions from subs.ts

export async function nachotoyGenerator(userUrl: string): Promise<string> {
    try {
        const urlParams = new URLSearchParams(new URL(userUrl).search);
        const code = urlParams.get('code');

        if (!code) {
            console.error('Code parameter is missing in the URL');
            return 'Error: Code parameter is missing';
        }

        // Get IMDB ID from the code
        const imdbId = await getImdbId(code);
        if (!imdbId) {
            console.error('IMDB ID not found for the given code');
            return 'Error: IMDB ID not found';
        }

        // Fetch subtitles URL
        const subtitlesUrl = await fetchSubtitlesUrl(imdbId);
        if (!subtitlesUrl) {
            console.error('Subtitles URL not found for the given IMDB ID');
            return 'Error: Subtitles URL not found';
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

        // Add subtitles URL to the m3u8 content
        const m3u8Content = m3u8Response.data;
        const updatedM3u8Content = `#EXTM3U\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Hebrew",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,LANGUAGE="he",URI="${subtitlesUrl}"\n${m3u8Content}`;

        return updatedM3u8Content; // Return the updated m3u8 content
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
