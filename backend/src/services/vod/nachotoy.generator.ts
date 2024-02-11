import axios from 'axios';
import localMovies from '../movies/movies.json';

type Movie = {
    name: string;
    description: string;
    original: string;
    length: number;
    release: string;
    genre: string;
    rating: string;
    poster: string;
    backdrop: string;
    code: string;
    imdb: string;
    // Define the structure for subtitle properties if they follow a consistent pattern
    [key: string]: string | number;
};

async function getCombinedMovies(): Promise<Movie[]> {
    try {
        const remoteMoviesUrl = 'https://raw.githubusercontent.com/dikodahan/share03/main/src/data/new.json';
        const response = await axios.get<Movie[]>(remoteMoviesUrl);
        const remoteMovies = response.data;
        return [...localMovies as Movie[], ...remoteMovies];
    } catch (error) {
        console.error('Error fetching remote movies:', error);
        return localMovies as Movie[]; // Fallback to local movies in case of an error
    }
}

export async function nachotoyGenerator(userUrl: string): Promise<string> {
    const movies = await getCombinedMovies();
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

        // Find the corresponding movie based on the code
        const movie = movies.find((m: Movie) => m.code === code);
        if (movie) {
            let subtitlesContent = '';
            let subtitlesAdded = false;

            for (let i = 1; i <= 9; i++) {
                const subsKey = `subs-${i}` as keyof typeof movie;
                const langKey = `lang-${i}` as keyof typeof movie;
                const labelKey = `label-${i}` as keyof typeof movie;

                if (movie[subsKey] && movie[langKey] && movie[labelKey]) {
                    const lang = movie[langKey] as string;
                    const subs = movie[subsKey] as string;
                    const label = movie[labelKey] as string;
                    const defaultFlag = subtitlesAdded ? 'NO' : 'YES';

                    // Extract subtitle ID from the URL
                    let subtitleId = subs.split('/').pop()?.split('.')[0];
                    if (subs.includes('raw.githubusercontent.com')) {
                        // For OpenSubtitles, extract the ID from the GitHub URL
                        const parts = subs.split('/');
                        subtitleId = parts[parts.length - 2];
                    }
                    
                    // Construct new URI
                    const newUri = `https://raw.githubusercontent.com/dikodahan/share03/main/subs/${movie.imdb}/${subtitleId}/prog_index.m3u8`;

                    // Build subtitle line
                    subtitlesContent += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="${label}",DEFAULT=${defaultFlag},AUTOSELECT=YES,FORCED=NO,LANGUAGE="${lang}",URI="${newUri}"\n`;
                    subtitlesAdded = true;
                }
            }

            if (subtitlesAdded) {
                // Build custom m3u8 content
                return `#EXTM3U\n#EXT-X-VERSION:3\n${subtitlesContent}#EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="subs"\n${videoUrl}`;
            }
        }

        // Return the original video URL if no subtitles are found
        return `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="subs"\n${videoUrl}`;
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