import axios from 'axios';
import movies from '../movies/movies.json';

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
        
        // Find the corresponding movie based on the code
        const movie = movies.find(m => m.code === code);
        if (movie) {
            let m3u8Content = m3u8Response.data;
            let subtitlesContent = '';
            let subtitlesAdded = false;

            for (let i = 1; i <= 5; i++) {
                const subsKey = `subs-${i}` as keyof typeof movie;
                const langKey = `lang-${i}` as keyof typeof movie;

                if (movie[subsKey] && movie[langKey]) {
                    const lang = movie[langKey] as string;
                    const subs = movie[subsKey] as string;
                    const name = lang === 'he' ? 'עברית' : 'English';
                    const defaultFlag = subtitlesAdded ? 'NO' : 'YES';

                    // Build subtitle line
                    subtitlesContent += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="${name}",DEFAULT=${defaultFlag},AUTOSELECT=YES,FORCED=NO,LANGUAGE="${lang}",URI="${subs}"\n`;
                    subtitlesAdded = true;
                }
            }

            if (subtitlesAdded) {
                // Split the m3u8 content
                const parts = m3u8Content.split("#EXTINF:");
                // Insert subtitles and EXT-X-STREAM-INF line
                m3u8Content = parts[0] + subtitlesContent + '#EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="subs"\n' + "#EXTINF:" + parts.slice(1).join("#EXTINF:");
            }

            return m3u8Content;
        }

        return m3u8Response.data; // Return the original content if no subtitles are found
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