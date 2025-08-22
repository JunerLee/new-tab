// Chrome Extension Background Script
// This script runs in the background and handles extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
  console.log('New Tab Extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'chrome://newtab/' });
});

// Initialize extension settings
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});