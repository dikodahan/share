import express, { Request, Response } from 'express';
import { scrapeMovies } from './services/vod/nachotoy-search';

const app = express();

app.use(express.json());

app.post('/api/scrape-movies', async (req: Request, res: Response) => {
    const searchQuery: string = req.body.query;
    // Call the function to perform web scraping
    const movies = await scrapeMovies(searchQuery);
    res.json({ movies });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
