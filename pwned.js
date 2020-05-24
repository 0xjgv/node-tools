#!/usr/bin/env node
const puppeteer = require("puppeteer");
const fs = require('fs');

const platform = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';

async function isPwned(email) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const url = `https://haveibeenpwned.com/unifiedsearch/${email}`;
    console.log("Checking", email)
    const [page] = await browser.pages();
    await page.setUserAgent(platform);
    const response = await page.goto(url);
    const { Breaches } = await response.json();
    return Breaches;
  } catch(error) {
    console.log(error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const args = process.argv;
if (process.stdin.isTTY) {
  const { program } = require('commander');
  program
    .version('0.0.1', '-v, --version', 'Output the current version')
    .description('Check if an email has been pwned')
    .option("-o --out <output_filename>", "Output redirections into a file")
    .arguments('<email>')
    .action(async (email, args) => {
      const result = await isPwned(email);
      if (args.out) {
        const outputFile = /\.json$/.test(args.out) ? args.out : `${args.out}.json`;
        fs.writeFileSync(`./${outputFile}`, JSON.stringify(result, null, 2));
      }
      console.log(result);
    })
    .parse(args);
} else {
  const { createInterface } = require('readline');
  const { 2: out, 3: outFilename } = args;
  if (out && !outFilename) {
    console.log("Missing required <output_filename> for '-o, --out <output_filename>'");
  }
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  rl.on('line', url => {
    isPwned(url, { out: out && outFilename });
  });
}