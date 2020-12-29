// Libraries
const Discord = require(`discord.js`);
const fetch = require(`node-fetch`);

// JSON files
const scoreUrls = require(`../assets/scoreUrls.json`);
const leagueColors = require(`../assets/leagueColors.json`);

// Functions
const getHTML = require(`../functions/getHTML.js`);

module.exports = {
    name: `scores`,
    aliases: [`score`, `scoreboard`, `s`],
    async execute(message, args, mode) {
        // Deciding which url to request from
        let url, today;
        if (!args[0] || args[0].toLowerCase() == `today`) {
            // Looking for only today's scores
            url = scoreUrls[mode][0];
            today = true;
        } else {
            // Looking for scores from another date
            switch (mode) {
                case `nba`: // date needed
                    if (!args[0].split(``).includes(`/`)) return message.channel.send(`Please provide a valid date. E.g. \`nba scores 2019/03/02\` (yyyy/mm/dd format).`);
                    if (args[0].split(`/`).length != 3) return message.channel.send(`Please provide a valid date. E.g. \`nba scores 2019/03/02\` (yyyy/mm/dd format).`);
                    if (args[0].split(`/`)[1].length == 1) args[0] = `${args[0].split('/')[0]}/0${args[0].split('/')[1]}/${args[0].split('/')[2]}`;
                    if (args[0].split(`/`)[2].length == 1) args[0] = `${args[0].split('/')[0]}/${args[0].split('/')[1]}/0${args[0].split('/')[2]}`;
                    if (args[0].split(`/`)[0].length != 4 || args[0].split('/')[1].length != 2 || args[0].split(`/`)[2].length != 2) return message.channel.send(`Please provide a valid date. E.g. \`nba scores 2019/03/02\` (yyyy/mm/dd format).`);
                    if (parseInt(args[0].split(`/`)[1]) > 12 || parseInt(args[0].split(`/`)[2]) > 31) return message.channel.send(`Please provide a valid date. E.g. \`nba scores 2019/03/02\` (yyyy/mm/dd format).`);

                    url = scoreUrls[mode][1].split(`[date]`).join(args[0].split(`/`).join(``));
                    today = false;
                    break;
                
                case `nfl`: // [year, seasontype, week] needed
                    break;
            }
        }

        // Requesting info
        let html = await getHTML(url);

        // Narrowing down scraped HTML to find JSON object
		html = html.substring(html.search(`window.espn.scoreboardData`), html.length);
		html = html.substring(html.search(`{`), html.search(`}}}]}`) + `}}}]}`.length);

		// Finalling turning it into a JSON object
		if (!JSON.parse(html)) message.reply(`an error occurred fetching scores from that date.`);
        let json = JSON.parse(html);
        
        // Setting up an embed
        let embed = new Discord.MessageEmbed()
            .setTitle(`${mode.toUpperCase()} scores for ${(today) ? `today, ` : ``}`)
            .setColor(leagueColors[mode])
            .setFooter(`ScoreBot by chig#4519`);

        for (var i = 0; i < json.events.length; i++) {
            let game = json.events[i].competitions[0];
            let str1 = ``, str2 = `...`;

            str1 += `${game.competitors[0].team.shortDisplayName} ${game.competitors[0].score} - ${game.competitors[1].score} ${game.competitors[0].team.shortDisplayName}`;
            // Seeing if a headline is available
            if (game.headlines) {
                if (game.headlines[0]) {
                    if (game.headlines[0].shortLinkText) {
                        // Seeing if a video is available, then add as link
                        str2 = `${game.headlines[0].shortLinkText}`;
                    }
                }
            }

            try {
                embed.addField(str1, str2);
            } catch (e) {
                continue;
            }
        }

        return message.channel.send(embed);
    }
}