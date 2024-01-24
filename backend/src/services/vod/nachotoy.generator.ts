import fetch from 'node-fetch';

export async function nachotoyGenerator(userUrl: string): Promise<string> {
    try {
        const urlParams = new URLSearchParams(new URL(userUrl).search);
        const code = urlParams.get('code');

        if (!code) {
            console.error('Code parameter is missing in the URL');
            return 'Error: Code parameter is missing';
        }

        const apiUrl = `https://nachotoy.com/api/videoLink/${code}/0/0/1`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { message: string };
        const message = data.message;
        const videoUrl = message.split(',')[0].replace(/"/g, '');

        return videoUrl;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error in loadVideo method:', error.message);
            return `Error: ${error.message}`;
        } else {
            console.error('An unexpected error occurred');
            return 'Error: An unexpected error occurred';
        }
    }
}