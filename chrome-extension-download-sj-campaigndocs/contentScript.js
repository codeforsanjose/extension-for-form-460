var extensionId = "hgcpeepppnjoajcfdifnfdhggoacgjfk";
var startPage = 0;
var totalPage = 8;
var formType = 0;
var fillingDatePos = 1;
var filerNamePos = 2;
var lastNamePos = 3;
var firstNamePos = 4;
var downloadPos = 7;

downloadSheetsForCurrentPage({
  fillingDatePos: fillingDatePos,
  filerNamePos: filerNamePos,
  lastNamePos: lastNamePos,
  firstNamePos: firstNamePos,
  downloadPos: downloadPos
});

function downloadSheetsForCurrentPage(config) {
  var fillingDatePos = config.fillingDatePos;
  var filerNamePos = config.filerNamePos;
  var lastNamePos = config.lastNamePos;
  var firstNamePos = config.firstNamePos;
  var downloadPos = config.downloadPos;
  var allRowsOnPage = $(".dxgvDataRow_Glass");
  var index = 0;
  console.log("all rows", allRowsOnPage.length);
  function downloadRow(index) {
    if (index >= allRowsOnPage.length) {
      console.log("completed all downloads");
      return;
    }
    console.log("Downloading row", index);
    var row = allRowsOnPage[index];
    var lastName = $(row).children()[lastNamePos];
    lastName = lastName ? lastName.innerText : "";
    var firstName = $(row).children()[firstNamePos];
    firstName = firstName ? firstName.innerText : "";
    var filerName = $(row).children()[filerNamePos].innerText;
    var date = $(row).children()[fillingDatePos].innerText;
    var formattedDate = formatDate(date);

    // strip spaces
    filerName = filerName.split(" ").join("");
    // candidatename_filer_460_YYYYMMDD.xls
    var fileName =
      lastName + firstName + "_" + filerName + "_460_" + formattedDate + ".xls";

    chrome.runtime.sendMessage(extensionId, { fileName: fileName }, function(
      response
    ) {
      console.log(response.received, response.fileName);
      if (response.received) {
        var excelDownloadColumn = $(row).children()[downloadPos];
        var excelDownloadLink = $(excelDownloadColumn).children()[0];
        if (!excelDownloadLink) {
          console.log(
            "This row doesn't have an excel sheet to download: ",
            fileName
          );
          downloadRow(++index);
        } else {
          excelDownloadLink.click();
        }
      }
    });
  }

  var fileNameMap = {};
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("received message", request);
    if (request.type === "download") {
      if (request.filename) {
        fileNameMap[request.id] = request.filename.current;
      }
      if (request.status && request.status.current === "complete") {
        console.log("download finished for", fileNameMap[request.id]);
        downloadRow(++index);
      }
    }
  });

  downloadRow(0);
}

// format YYYYMMDD
function formatDate(dateString) {
  var d = new Date(dateString);
  // getMonth returns 0 for january
  var month = String(d.getMonth() + 1);
  var date = String(d.getDate());
  month = addZeroIfSingleDigit(month);
  date = addZeroIfSingleDigit(date);

  return "" + d.getFullYear() + month + date;
}

function addZeroIfSingleDigit(str) {
  if (str.length === 1) {
    return "0" + str;
  }
  return str;
}
