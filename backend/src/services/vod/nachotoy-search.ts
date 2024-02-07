const puppeteer = require('puppeteer');

export async function scrapeMovies(searchQuery: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://nachotoy.com');

    // Enter the search query into the search box and click the search button
    await page.type('.header__SearchInput-sc-pqvnyq-4', searchQuery);
    await page.click('.header__SearchIcon-sc-pqvnyq-8');

    // Wait for the results to load
    await page.waitForSelector('.card__Item-sc-am32tb-10');

    interface Movie {
        poster: string;
        name: string;
    }
    
    const movies = await page.evaluate(() => {
        const results: Movie[] = [];
        const items = document.querySelectorAll('.card__Item-sc-am32tb-10');
        items.forEach(item => {
            const poster = (item.querySelector('img') as HTMLImageElement).src;
            const name = (item.querySelector('.card__SubTitle-sc-am32tb-3') as HTMLElement).innerText;
            results.push({ poster, name });
        });
        return results;
    });    

    await browser.close();
    return movies;
}
