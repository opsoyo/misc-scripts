///
*
* Console script to collect links of a certain domain from
* Google search results page. Saves page results to list 
* and saves that page of results to Local Storage variable.
* The initial array is recovered and reused for each subsequent
* page. The Local Storage variable can be called and processed
* like a normal array.
*
*
///

var saveLinks = JSON.parse(window.localStorage.getItem("saveLinks")) || [];
let elmLinks = document.querySelectorAll('a[href^="https://example.com"]');
for (i=0,n=elmLinks.length; i<n; ++i) {
    let link = elmLinks[i].href;
    saveLinks.push(link);
}
window.localStorage.setItem("saveLinks", JSON.stringify(saveLinks));
document.querySelector('#pnnext').click();
