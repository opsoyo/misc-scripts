/**
 * Copyright (c) 2020
 *
 * Console script to collect M3U8 playlist files
 * from https://www.doyogawithme.com and output 
 * into a list suitable for FFmpeg.
 *
 * @author opsoyo <opsoyo@opsoyo.pw>
 *
 */

var playlistURIs = JSON.parse(window.localStorage.getItem("pURIs")) || [];
var videoURLs = JSON.parse(window.localStorage.getItem("vURLs")) || [];

var baseURL = 'https://www.doyogawithme.com/yoga-classes?page=';
var pageStart = 6;
var pageEnd = document.querySelector('a[title="Go to last page"]').href.split('=')[1] + 1;

async function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function htmlFetch(url) {
	let response = await fetch(url);
	let html = await response.text();
	let parser = new DOMParser();
	let htmlDoc = parser.parseFromString(html, "text/html");
	return htmlDoc;
}

async function getVideoPageURLs(url) {
    let htmlDocument = await htmlFetch(url);
	let pLinks = htmlDocument.documentElement.querySelectorAll('div.views-field.views-field-nothing > span > a[href*="/content/"]');
	return pLinks;
}

async function getVideoPlaylist(url) {
    let htmlDocument = await htmlFetch(url);
    // Construct JSON URI
    let videoPlayerId = htmlDocument.documentElement.querySelector('div.field-collection-view.clearfix.view-mode-full.field-collection-view-final > div').dataset.playerId;
    let videoPlayerSrcElm = htmlDocument.documentElement.querySelector('div.field-collection-view.clearfix.view-mode-full.field-collection-view-final > div > script');

    if(typeof(element) != 'undefined' && element != null){
        // Using CDN
        let videoPlayerSrc = videoPlayerSrcElm.innerHTML;
        let videoPlayerSrcId = videoPlayerSrc.match(/\"([a-zA-Z0-9-_]+)\"\,/)[1];
        let videoJSONURI = `https://play.lwcdn.com/web/public/native/config/${videoPlayerId}/${videoPlayerSrcId}`;

        let videoJSONFetch = await fetch(videoJSONURI);
        let videoJSON = JSON.parse(await videoJSONFetch.text());

        let videoJSONTitle = videoJSON['metadata']['title'];
        let videoJSONPlaylist = videoJSON['src'][0];

        return [videoJSONTitle, videoJSONPlaylist];
    } else {
        // Using something else
        return ['#None','#NoHandleForNonCDN'];
    }

}

async function saveLinksToFile(str) {
    let fileName = `doyogawithme.com_download_links.txt`;
    let fileType = "text/plain";
    let blob = new Blob([str], { type: fileType });
    let dElm = document.createElement("a");
    link = window.URL.createObjectURL(blob);
    dElm.href = link;
    dElm.download = fileName;
    dElm.dataset.downloadUrl = [ fileType, dElm.download, dElm.href].join(':');;
    document.body.appendChild(dElm);
    dElm.click();
    document.body.removeChild(dElm);
}

async function main () {
    let playlistURIStr = '';
	for (let i=parseInt(pageStart), n=parseInt(pageEnd); i<n; ++i) {
		let fetchUrl = `${baseURL}${i}`;
        let videoPageURLs = await getVideoPageURLs(fetchUrl);
		
		console.log(`Processing: ${fetchUrl}`);

        for (let x=0, p=videoPageURLs.length; x<p; ++x) {
            let videoPageURL = videoPageURLs[x].href;
            let videoPageData = await getVideoPlaylist(videoPageURL);

            playlistURIStr += `\n# ${videoPageData[0]}\n${videoPageData[1]}`

            await timer(200);
        }
       
        //await timer(1000);
    }

    console.log(`Making download link file...`);
    await saveLinksToFile(playlistURIStr);
}

main();
