// ==UserScript==
// @name         myPtExtension
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  适用于NexusPHP架构的pt站点，个人扩展脚本
// @author       https://github.com/yqhapi
// @match        https://*/torrents.php*
// @match        https://*/browse.php*
// @match        https://*/getusertorrentlist.php*
// @match        https://*/userdetails.php*
// @match        https://*/movie.php*
// @match        https://*/music.php*
// @match        https://*/adult.php*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
const SITEURL = new URL(document.location.href);
const SITEPATHNAME = SITEURL.pathname;
var sizeLocation; // 表中体积列
var sortOrder = "asc"; // 初始排序顺序为升序
var isShow = false; // 葡萄个人信息页面做种信息需要加载
var isUserPage = true; // 判断为用户信息页
var aElement; // 显示标签
var exportButton; // 导出按钮
var orderButton; // 排序按钮
var torrentsTable;
var infoArray;
if (SITEPATHNAME.includes("userdetails.php")) {
    if (SITEURL.hostname.includes(".im")) {
        aElement = document.querySelector("a[href*='klappe']");
        aElement.click();
    } else if (SITEURL.hostname.includes("sjtu")) {
        isShow = true;
    } else {
        aElement = document.querySelectorAll("a[href*='seeding']");
        aElement = aElement[aElement.length-1]
        aElement.click(); // 显示当前做种
    }
    if (!isShow) {
        exportButton = document.createElement("button");
        exportButton.innerHTML = "导出";
        aElement.parentNode.insertBefore(exportButton, aElement.nextSibling);
        exportButton.addEventListener("click", exportCurrentSeeding);
    }
}
if(SITEPATHNAME.includes("getusertorrentlist.php")){
    exportButton = document.createElement("button");
    exportButton.innerHTML = "导出";
    aElement = document.querySelector("a[href*='incomplete']");
    aElement.parentNode.insertBefore(exportButton, aElement.nextSibling);
    exportButton.addEventListener("click", exportCurrentSeeding);
    isUserPage = false;
}

orderButton = document.createElement("button");
orderButton.innerHTML = "升序";
orderButton.style.position = "fixed";
orderButton.style.right = "10px";
orderButton.style.top = "50%";
orderButton.style.transform = "translateY(-50%)";
orderButton.addEventListener("click", function () {
    if (isShow) {
        aElement = document.querySelector("a[href*='klappe']");
        aElement.click();
        isShow = false;
        var exportButton = document.createElement("button");
        exportButton.innerHTML = "导出";
        aElement.parentNode.insertBefore(exportButton, aElement.nextSibling);
        exportButton.addEventListener("click", exportCurrentSeeding);
    }
    sortOrder = (sortOrder === "asc") ? "desc" : "asc";
    orderButton.innerHTML = (sortOrder === "asc") ? "升序" : "降序";
    getTorrentsInfo();
});
document.body.appendChild(orderButton);

function exportCurrentSeeding() {
    if(isUserPage){
        if (SITEURL.hostname.includes(".im")) {
            torrentsTable = document.querySelector('#ka2 table[border="1"]')
        } else {
            torrentsTable = document.querySelector('#ka1 table[border="1"]'); //#ka1 > table
        }
    }else{
        torrentsTable = document.querySelector('table[border="1"]');
    }
    let rows = Array.from(torrentsTable.rows);
    let rowNumber = rows.length;
    let colNumber = rows[0].cells.length;
    infoArray = Array.from({
            length: rowNumber,
        },
        () => Array(colNumber)
    );
    for (let i = 0; i < (rowNumber * colNumber); i++) {
        infoArray[Math.floor(i / colNumber)][i % colNumber] =
            rows[Math.floor(i / colNumber)].cells[i % colNumber].textContent.trim();
    }
    let loseTitle = ['体积','种子数','下载数','完成数'];
    let newTitle = infoArray[0]
    let j=0;
    for(let i=0;i<newTitle.length;i++){
        if(newTitle[i] === ''){
            newTitle[i] = loseTitle[j++];
        }
    }
    infoArray[0] = newTitle;
    let csvContent = '';
    infoArray.forEach(function (rowArray) {
        let row = rowArray.join(',');
        csvContent += row + "\r\n";
    })
    let blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getDomain(SITEURL.hostname) + ".csv");
    link.click();
}

function getTorrentsInfo() {
    if (SITEPATHNAME.includes("getusertorrentlist.php")) { // 做种信息页面
        torrentsTable = document.querySelector('table[border="1"]');
        if (SITEURL.hostname.includes("pter")) {
            sizeLocation = 3;
        } else if (SITEURL.hostname.includes("school") || SITEURL.hostname.includes("52pt")) {
            sizeLocation = 2;
        }
    } else if (SITEPATHNAME.includes("userdetails.php")) { // 个人信息页面
        if (SITEURL.hostname.includes(".im")) {
            torrentsTable = document.querySelector('#ka2 table[border="1"]')
            sizeLocation = 3;
        } else {
            torrentsTable = document.querySelector('#ka1 table[border="1"]'); //#ka1 > table
            if (SITEURL.hostname.includes("pter") || SITEURL.hostname.includes("hdfans") || SITEURL.hostname.includes("soul") || SITEURL.hostname.includes("hdtime")) {
                sizeLocation = 3;
            } else {
                sizeLocation = 2;
            }
        }
    } else { // 种子页面
        if (SITEURL.hostname.includes(".im")) {
            torrentsTable = document.querySelector("#torrent_table");
            sizeLocation = 6;
        } else {
            torrentsTable = document.querySelector(".torrents");
            sizeLocation = 4;
        }
    }
    let rows = Array.from(torrentsTable.rows);
    let header = rows.shift();
    let rowNumber = rows.length;
    let colNumber = rows[0].cells.length;
    infoArray = Array.from({
            length: rowNumber,
        },
        () => Array(colNumber)
    );
    for (let i = 0; i < (rowNumber * colNumber); i++) {
        infoArray[Math.floor(i / colNumber)][i % colNumber] =
            rows[Math.floor(i / colNumber)].cells[i % colNumber].textContent.trim();
    }
    infoArray.sort((a, b) => {
        let sizeA = convertToKB(a[sizeLocation]);
        let sizeB = convertToKB(b[sizeLocation]);

        return sortOrder === "asc" ? sizeB - sizeA : sizeA - sizeB;
    })
    let rowMap = {};
    rows.forEach(function (row) {
        var titleInHtml = row.cells[1].textContent.trim();
        rowMap[titleInHtml] = row;
    });

    infoArray.forEach(function (item) {
        let sizeInArray = item[1];
        let row = rowMap[sizeInArray];
        if (row) {
            torrentsTable.appendChild(row);
        }
    });
}

function convertToKB(size) {
    let parts = size.split(/([0-9.]+)/);
    let number = parseFloat(parts[1]);
    let unit = parts[2].trim();

    switch (unit) {
        case 'TB':
        case 'TiB':
            return number * 1024 * 1024 * 1024;
        case 'GB':
        case 'GiB':
            return number * 1024 * 1024;
        case 'MB':
        case 'MiB':
            return number * 1024;
        case 'KB':
        case 'KiB':
            return number;
        default:
            return number;
    }
}

function getDomain(url) {
    const arr = url.split(".");
    if (arr.length > 2) {
        return arr[0] + "." + arr[1];
    } else {
        return arr[0];
    }
}