declare module 'opensubtitles.com' {
    export class OpenSubtitles {
        constructor(config: any);
        search(query: any): Promise<any>;
    }
}