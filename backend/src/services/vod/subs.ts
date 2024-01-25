import OpenSubtitles from 'opensubtitles-api';
import fs from 'fs';
import path from 'path';

// Function to get the IMDB ID from the movies.json file
async function getImdbId(code: string): Promise<string | null> {
    const moviesPath = path.join(__dirname, '../movies/movies.json');
    const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
    const movie = moviesData.find((m: any) => m.code === code);
    return movie ? movie.imdb : null;
}

// Function to fetch subtitles URL using OpenSubtitles API
async function fetchSubtitlesUrl(imdbId: string): Promise<string | null> {
    const OpenSubtitlesClient = new OpenSubtitles({
        useragent: 'UserAgent', // Replace with your user agent
        username: 'Username', // Optional, for logging in
        password: 'Password', // Optional, for logging in
        ssl: true
    });

    try {
        const subtitles = await OpenSubtitlesClient.search({
            imdbid: imdbId,
            sublanguageid: 'heb', // Hebrew subtitles
            format: 'vtt' // WebVTT format
        });

        return subtitles.he ? subtitles.he.url : null;
    } catch (error) {
        console.error('Error fetching subtitles:', error);
        return null;
    }
}

// Export the functions for use in other files
export { getImdbId, fetchSubtitlesUrl };