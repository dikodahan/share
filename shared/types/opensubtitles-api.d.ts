declare module 'opensubtitles-api' {
    // Define a basic shape for the OpenSubtitles class
    export default class OpenSubtitles {
        constructor(config: any);
        search(query: any): Promise<any>;
    }
}