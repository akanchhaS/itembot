const puppeteer = require('puppeteer');
const CREDS = require('./creds');

// creds is a file that looks like this:
/*
module.exports = {
    myuser: 'username',
    mypw: 'password',
    twsid: 'twilio_sid',
    twauth: 'twilio_authtoken',
    twphoneto: 'to_phone',
    twphonefrom: 'from_phone'
}
*/

(async () => {

    // initialize twilio
    var twilio = require('twilio')
    var client = new twilio(CREDS.twsid, CREDS.twauth);

    // define the array of items being watched
    var watchitems = ["The Golden Hen"];

    // normally headless will be 'true' if its pure headless
    // here it is false because i want to keep an eye on the screen
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250 // slow down by 250ms
    });

    const page = await browser.newPage();

    // go to the mythea page
    await page.goto('http://www.mythea.com', {"waitUntil" : "networkidle"});
    console.log("Entering mythea...");

    await page.click('#mainid > div > div > div:nth-child(6) > div > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > input[type="TEXT"]');
    await page.type(CREDS.myuser);
    console.log("filled up username");

    await page.click('#pword');
    await page.type(CREDS.mypw);
    console.log("filled up password");

    // click the 'button'
    await page.click('#ic6');
    console.log("submitting the login");

    // infinite loop
    // reason for this is so that you just 'sleep' and watch the page
    // the way the page works is that AJAX calls auto-refresh
    while (1)
    {
      // Extract the value of the item sold
      const item = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('#auction > center > span'));
      return anchors.map(anchor => anchor.textContent);
      });

      // Extract the frequency
      const itemfrequency = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('#aucbox > div > div > center:nth-child(2)'));
      return anchors.map(anchor => anchor.textContent);
      });

      // Extract the current price
      const itemprice = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('#aucbox > div > div > center:nth-child(1) > table > tbody > tr > td:nth-child(1) > div.markbox > span:nth-child(1)'));
      return anchors.map(anchor => anchor.textContent);
      });

      console.log("----")

      // check if item is in watchlist
      for (i = 0; i < watchitems.length; i++)
      {
          if (String(item) == watchitems[i])
          {
              msgbody = watchitems[i] + " found";

              client.messages.create({
                to: CREDS.twphoneto,
                from: CREDS.twphonefrom,
                body: msgbody
              });

              console.log("ITEM FOUND: " + msgbody);

          } // end if

      } // end for

      console.log("Time: " + Date())
      console.log("Item: " + item);
      console.log("Frequency: " + itemfrequency);
      console.log("Price: " + itemprice)

      // check every 60s
      await sleep(60000)

    } // end while

    // sleep function
    function sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
