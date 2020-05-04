#!/usr/bin/env node
const puppeteer = require('puppeteer');
const { URL } = require("url")
const fs = require("fs");

const platform = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
const div = "\n";

async function followRedirects(url, display = true) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const [page] = await browser.pages();
    await page.setRequestInterception(true);
    const chainRequests = [];
    page.on('request', request => {
      const chain = request.redirectChain();
      const idx = chain.length;
      if (chainRequests[idx]) {
        request.abort();
      } else {
        const interceptedUrl = request.url();
        chainRequests[idx] = interceptedUrl;
        request.continue();
      }
    });
    await page.setUserAgent(platform);
    await page.goto(url);
    display && console.log(chainRequests.join(div));
    return chainRequests;
  } catch (error) {
    console.log(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function fredirect(url, { out } = { out: false }) {
  try {
    if (!/^http/.test(url)) {
      url = `http://${url}`;
    }
    const { href } = new URL(url);
    const redirects = await followRedirects(href, !Boolean(out));
    out && fs.appendFileSync(`${out}.txt`, redirects.join(div) + div);
  } catch (error) {
    console.log(error);
    const errorMessage = "Please enter a valid url";
    console.log(errorMessage);
  }
}

const args = process.argv;
if (process.stdin.isTTY) {
  const { program } = require('commander');
  program
    .version('0.0.1', '-v, --version', 'Output the current version')
    .description('Check all the redirections of a URL')
    .option("-o --out <output_filename>", "Output redirections into a file")
    .arguments('<url>')
    .action(fredirect)
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
    fredirect(url, { out: out && outFilename });
  });
}