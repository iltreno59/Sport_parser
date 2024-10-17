const request = require('request');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'global_sport.csv',
    header: [
        { id: 'number', title: 'Number' },
        { id: 'home_team', title: 'Home team name' },
        { id: 'away_team', title: 'Away team name' },
        { id: 'home_team_score', title: 'Home goals' },
        { id: 'away_team_score', title: 'Away goals' },
        { id: 'date', title: 'Date' },
        { id: 'start_time', title: 'Time' }
    ]
});

let currentDate = new Date('2024-09-15');
const endDate = new Date('2024-10-15');

let iteration = 1;

const matches = [];

function send_request(date){
    return new Promise((resolve) =>{
        const formattedDate = date.toISOString().split('T')[0]; // Форматируем дату в YYYY-MM-DD
const options = {
    url: `https://globalsportsarchive.com/sport_ajax.php?d=${formattedDate}&widget_client_id=1&sp=soccer`,
    method: 'GET'
};
request(options, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    const $ = cheerio.load(body);
    let smh = $('div[class="Played 7 continent"]');
    for (let i = 0; i < smh.length; i++) {
        try {
            const number = iteration;
            const home_team = smh[i].children[1].children[1].children[0].data;
            const away_team = smh[i].children[5].children[1].children[0].data;
            const home_team_score = smh[i].children[3].children[0].data.split(' : ')[0];
            const away_team_score = smh[i].children[3].children[0].data.split(' : ')[1];
            const start_time = smh[i].children[0].children[0].children[0].children[0].data;
            const match = {
                number: number,
                home_team: home_team,
                away_team: away_team,
                home_team_score: home_team_score,
                away_team_score: away_team_score,
                date: formattedDate,
                start_time: start_time
            }
            matches.push(match);
            iteration++;
        }
        catch (err) {
            continue;
        }
    }
    resolve();
});
    });
}
async function main() {
    while (currentDate <= endDate){
        await send_request(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }

    console.log(matches.length);
    await csvWriter.writeRecords(matches);
    console.log(`Количество записей: ${matches.length}`);
    console.log(`Количество столбцов: ${Object.keys(matches[0]).length}`);
}
main()
