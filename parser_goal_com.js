const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'goal_com.csv',
    header: [
        { id: 'number', title: 'Number' },
        { id: 'competition', title: 'Competiton' },
        { id: 'home_team', title: 'Home team name' },
        { id: 'away_team', title: 'Away team name' },
        { id: 'home_score', title: 'Home goals' },
        { id: 'away_score', title: 'Away goals' },
        { id: 'home_red_cards', title: 'Home Red Cards' },
        { id: 'away_red_cards', title: 'Away Red Cards' },
        { id: 'date', title: 'Date' }
    ]
});

let currentDate = new Date('2024-09-15');
const endDate = new Date('2024-10-15');

let iteration = 1;

const games = [];


function send_request(date){
    return new Promise((resolve) =>{
        const formattedDate = date.toISOString().split('T')[0]; // Форматируем дату в YYYY-MM-DD
const options = {
    url: `https://www.goal.com/api/live-scores/refresh?edition=en-gb&date=${formattedDate}&tzoffset=180`,
    method: 'GET'
};

request(options, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    const data_json = JSON.parse(body);
    for(let i = 0; i < data_json.liveScores.length; i++){
        const competition = data_json.liveScores[i].competition.name;
        for(let j = 0; j <data_json.liveScores[i].matches.length; j++){
            const number = iteration;
            try{
            const start_date = data_json.liveScores[i].matches[j].startDate;
            const home_team = data_json.liveScores[i].matches[j].teamA.name;
            const away_team = data_json.liveScores[i].matches[j].teamB.name;
            const home_score = data_json.liveScores[i].matches[j].score.teamA;
            const away_score = data_json.liveScores[i].matches[j].score.teamB;
            const home_red_cards = data_json.liveScores[i].matches[j].redCards.teamA;
            const away_red_cards = data_json.liveScores[i].matches[j].redCards.teamB;
            const game ={
                number: number,
                competition: competition,
                start_date: start_date,
                home_team: home_team,
                away_team: away_team,
                home_score: home_score,
                away_score: away_score,
                home_red_cards: home_red_cards,
                away_red_cards: away_red_cards,
                date: formattedDate
            }
            games.push(game);
            iteration++;
            }
            catch(err){
                continue;
            }
        }
    }
    resolve();
    //const number = 1;
    //console.log(number);
    //console.log(data_json.liveScores[0].competition.name);
    //console.log(data_json.liveScores[0].matches[0].startDate);
    //console.log(data_json.liveScores[0].matches[0].teamA.name);
    //console.log(data_json.liveScores[0].matches[0].teamB.name);
    //console.log(data_json.liveScores[0].matches[0].score.teamA);
    //console.log(data_json.liveScores[0].matches[0].score.teamB);
    //console.log(data_json.liveScores[0].matches[0].redCards.teamA);
    //console.log(data_json.liveScores[0].matches[0].redCards.teamB);
});
    });
}
async function main() {
    while (currentDate <= endDate){
        await send_request(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }

    console.log(games.length);
    await csvWriter.writeRecords(games);
    console.log(`Количество записей: ${games.length}`);
    console.log(`Количество столбцов: ${Object.keys(games[0]).length}`);
}
main()