///
*
* Console script to download attachments from
* ThotHub.tv post pages. Uses Fetch API and content 
* disposition header to save files into a zip file.
* Uses JSZip and FileSaver.
*
* Zip file names appear like: threadname_page_30.zip
*
*
///

var doneLinks = JSON.parse(window.localStorage.getItem("doneLinks")) || [];
var attachLinks = document.querySelectorAll('.message-attachments .attachment a[href^="/index.php?attachments/"]');

async function injectScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', e => reject(e.error));
        document.head.appendChild(script);
    });
}

async function dlFileBlob(url) {
    let response = await fetch(url, {method: 'GET'});
    let contdisp = await response.headers.get("content-disposition")
    let filename = await contdisp.split('filename=')[1].replace(/"/g, '');
    let blob = await response.blob();
    return [filename,blob];
}

async function main() {
    let queryStr = window.location.search.split('/');
    let threadName = queryStr[1];
    let threadPage = queryStr[2].length > 0 ? queryStr[2] : 'page-1';
    let zip = new JSZip();
    for (i=0,n=attachLinks.length; i<n; ++i) {
        let attachLink = attachLinks[i].href;
        if (doneLinks.indexOf(attachLink) == -1) {
            console.log(`Downloading ${attachLink}...`);
            let fBlob = await dlFileBlob(attachLink);
            zip.file(fBlob[0], fBlob[1]);
            doneLinks.push(attachLink);
        }
    }
    zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            let zipname = `${threadName}_${threadPage}`.replace(/[^A-Z0-9]+/ig, "_");
            saveAs(content, zipname);
        })
    window.localStorage.setItem("doneLinks", JSON.stringify(doneLinks));
    //document.querySelector('#pnnext').click();
}

await injectScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.2/FileSaver.min.js').then(() => {
    console.log('Script loaded!');
});
await injectScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.5.0/jszip.min.js').then(() => {
    console.log('Script loaded!');
});
await main();
