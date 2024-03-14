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

async function fetchHLSContent(url: string): Promise<string> {
    try {
        const response = await axios.get(url, { responseType: 'text' });
        return response.data;
    } catch (error) {
        console.error('Error fetching HLS content:', error);
        throw new Error('Failed to fetch HLS content');
    }
}

export async function nachotoyGenerator(userUrl: string): Promise<string> {
    const movies = await getCombinedMovies();
    let subtitlesContent = ''; // Constructed as before
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

        let videoUrl = response.data.message;
        const isMasterFile = videoUrl.endsWith('master.m3u8');

        const movie = movies.find((m: Movie) => m.code === code);
        let subtitlesAdded = false;

        if (movie) {
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
                return `#EXTM3U\n#EXT-X-VERSION:3\n${subtitlesContent}#EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE,SUBTITLES="subs"\n${videoUrl}`;
            }
        }

        if (isMasterFile) {
            let masterContent = await fetchHLSContent(videoUrl);
            
            // Step 1: Ensure we do not duplicate the #EXTM3U tag
            masterContent = masterContent.replace('#EXTM3U', '').trim();

            // Step 2: Check and add #EXT-X-VERSION:3 if not present
            if (!masterContent.startsWith('#EXT-X-VERSION')) {
                masterContent = '#EXT-X-VERSION:3\n' + masterContent;
            }
            
            // Adding subtitles content
            masterContent = `${subtitlesContent}\n${masterContent}`;

            // Step 4: Modify each #EXT-X-STREAM-INF line to include CLOSED-CAPTIONS=NONE,SUBTITLES="subs",
            const lines = masterContent.split('\n');
            const modifiedLines = lines.map(line => {
                if (line.startsWith('#EXT-X-STREAM-INF')) {
                    const parts = line.split(',');
                    const insertIndex = parts.findIndex(part => part.startsWith('CODECS'));
                    if (insertIndex !== -1) {
                        // Inserting the CLOSED-CAPTIONS and SUBTITLES part just before CODECS
                        parts.splice(insertIndex, 0, 'CLOSED-CAPTIONS=NONE', 'SUBTITLES="subs"');
                    }
                    return parts.join(',');
                }
                return line;
            });
            
            return modifiedLines.join('\n');
        } else {
            // Handling for playlist file or master file without subtitles
            return `#EXTM3U\n#EXT-X-VERSION:3\n${subtitlesAdded ? subtitlesContent : ''}#EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE,SUBTITLES="subs"\n${videoUrl}`;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            return `Error: ${error.message}`; // Ensure a string is returned after logging the error
        } else {
            console.error('An unknown error occurred');
            return 'Error: An unknown error occurred'; // Provide a fallback return statement
        }
    }
    // Fallback return statement in case other code paths do not return
    return 'An unexpected issue occurred, and the operation could not be completed.';
}