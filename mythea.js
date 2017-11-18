const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const SETTINGS = require('./settings');
var email = require('./email');
fs = require('fs');

// initialize twilio    
var twilio = require('twilio')
var client = new twilio(CREDS.twsid, CREDS.twauth);

// creds is a file that looks like this:
/*
module.exports = {
    myuser: 'username',
    mypw: 'password',
    twsid: 'twilio_sid',
    twauth: 'twilio_authtoken',
    twphoneto: 'to_phone',
    twphonefrom: 'from_phone'
    emailuser: 'whatsyouremail',
    emailpw: 'whatsyouremailpw',
    toemailaddresses: 'toemailaddresses'    
}
*/

(async () => {


    // normally headless will be 'true' if its pure headless
    // here it is false because i want to keep an eye on the screen
    const browser = await puppeteer.launch({
        headless: true,
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

      // taken from: https://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array
      var watchitems = fs.readFileSync(SETTINGS.itemfile).toString().split("\n");
      console.log("Currently watched items:")
      for(i in watchitems) {
          console.log(i + " - " + watchitems[i]);
      }

      // check if item is in watchlist
      // watchlist is defined in a txt file
      for (i = 0; i < watchitems.length; i++)
      {
          if (String(item) == watchitems[i])
          {
              msgbody = watchitems[i];

              console.log("ITEM FOUND: " + msgbody);              

              // send sms
              // controlled in settings
              if (SETTINGS.sendsms == 'yes')
              {
                console.log("sending sms")
                client.messages.create({
                    to: CREDS.twphoneto,
                    from: CREDS.twphonefrom,
                    body: msgbody
                });

              } // end if

              // send an email
              // controlled in settings
              if (SETTINGS.sendemail == 'yes')
              {   
                  console.log("sending email")           
                  email.send(CREDS.emailuser, CREDS.toemailaddresses, "ITEM FOUND - " + msgbody, "");
              } // end if
                      
          } // end if

      } // end for

      console.log("Time: " + Date())
      console.log("Item: " + item);
      console.log("Frequency: " + itemfrequency);
      console.log("Price: " + itemprice)          
  

      // sleep for a period defined in the settings file
      await sleep(SETTINGS.sleeptime)

    } // end while

    // sleep function
    function sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
