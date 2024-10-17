const request = require('request');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const competition = 'Premier League';

let iteration = 1;

const csvWriter = createCsvWriter({
    path: 'yahoo.csv',
    header: [
        { id: 'number', title: 'Number' },
        { id: 'home_team', title: 'Home team name' },
        { id: 'away_team', title: 'Away team name' },
        { id: 'home_score', title: 'Home goals' },
        { id: 'away_score', title: 'Away goals' },
        { id: 'week', title: 'Week'},
        { id: 'competition', title: 'Competition' }
    ]
});
const matches = [];

let date_range = 1;
const date_range_max = 7;

function send_request(date_range){
    return new Promise((resolve) =>{
const options = {
    url: `https://sports.yahoo.com/soccer/scoreboard/?confId=&dateRange=${date_range}&schedState=2`,
    method: 'GET'
};

request(options, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    const $ = cheerio.load(body);
    for(let i = 0; i < 20; i += 2){
    try{
    const element_team = $("div.score span[class='YahooSans Fw(700)! Fz(14px)!']"); // HOME - 0, AWAY - 1
    //console.log(element_team[1].children[0].data);
    const element_score = $("div.score span[class='YahooSans Fw(700)! Va(m) Fz(24px)!']"); // HOME - 0, AWAY - 1
    //console.log(element_score[1].children[0].data);
    const element_week = $("option[selected]");
    //console.log(element_week[1].children[0].data.split(' ')[1].trim());
    const number = iteration;
    const match = {
        number: number,
        home_team: element_team[i].children[0].data,
        away_team: element_team[i + 1].children[0].data,
        home_score: element_score[i].children[0].data,
        away_score: element_score[i + 1].children[0].data,
        week: element_week[1].children[0].data.split(' ')[1].trim(),
        competition: competition
    }
    matches.push(match);
    iteration++;
    }
    catch(err){
        continue;
    }
    }
    resolve(); 
});
    });
}
async function main() {
    while (date_range <= date_range_max){
        await send_request(date_range);
        date_range++;
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }

    console.log(matches.length);
    await csvWriter.writeRecords(matches);
    console.log(`Количество записей: ${matches.length}`);
    console.log(`Количество столбцов: ${Object.keys(matches[0]).length}`);
}
main()