# itembot
Used to look for certain items and then send an sms

## Software requirements

nodejs (minimum 7.0, check using node --version)

puppeteer

twilio

nodemailer

## Usage

```node mythea.js```

## How it works

* settings.js contains a list of basic settings

* The script logs in using credentials

* It checks if the item currently running is listed on *item.txt*

If yes, depending on the alerting settings in *settings.js*, it can do one of the following:

* nothing

* send a sms

* send an email

* send both an sms and email
