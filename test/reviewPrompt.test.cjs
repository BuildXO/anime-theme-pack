const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

const DAY = 24 * 60 * 60 * 1000;
let nextChoice;
let shown = [];
let opened = [];

const fakeVscode = {
  window: {
    showInformationMessage: async (msg, ...buttons) => {
      shown.push({ msg, buttons });
      return nextChoice;
    },
  },
  env: { openExternal: async (uri) => { opened.push(uri.toString()); return true; } },
  Uri: { parse: (s) => ({ toString: () => s }) },
};

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'vscode') { return fakeVscode; }
  return origLoad.call(this, request, ...rest);
};

const { maybePromptForReview } = require(path.join(__dirname, '..', 'out', 'reviewPrompt.js'));

function makeContext(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    store,
    globalState: {
      get: (k) => store.get(k),
      update: async (k, v) => { store.set(k, v); },
    },
  };
}

// Ready state: installed 8 days ago, 9 prior activations (this run makes 10).
const ready = () => makeContext({
  'anime.review.installDate': Date.now() - 8 * DAY,
  'anime.review.activationCount': 9,
});

test.beforeEach(() => { shown = []; opened = []; nextChoice = undefined; });

test('does not prompt on a fresh install', async () => {
  const ctx = makeContext();
  await maybePromptForReview(ctx);
  assert.equal(shown.length, 0);
  assert.equal(ctx.store.get('anime.review.activationCount'), 1);
});

test('does not prompt before 7 days or before 10 activations', async () => {
  const young = makeContext({ 'anime.review.installDate': Date.now() - 2 * DAY, 'anime.review.activationCount': 50 });
  await maybePromptForReview(young);
  const few = makeContext({ 'anime.review.installDate': Date.now() - 30 * DAY, 'anime.review.activationCount': 3 });
  await maybePromptForReview(few);
  assert.equal(shown.length, 0);
});

test('prompts with the three buttons when thresholds are met; dismissing changes nothing', async () => {
  const ctx = ready();
  nextChoice = undefined; // user closes the toast
  await maybePromptForReview(ctx);
  assert.equal(shown.length, 1);
  assert.deepEqual(shown[0].buttons, ['Rate on Marketplace', 'Later', "Don't Ask Again"]);
  assert.equal(ctx.store.get('anime.review.state'), undefined);
  assert.equal(ctx.store.get('anime.review.snoozeUntil'), undefined);
  assert.equal(opened.length, 0);
});

test('Rate opens the Marketplace review page and never prompts again', async () => {
  const ctx = ready();
  nextChoice = 'Rate on Marketplace';
  await maybePromptForReview(ctx);
  assert.equal(opened.length, 1);
  assert.match(opened[0], /marketplace\.visualstudio\.com\/items\?itemName=LunaCode\.anime-theme/);
  assert.equal(ctx.store.get('anime.review.state'), 'done');
  await maybePromptForReview(ctx);
  assert.equal(shown.length, 1);
});

test('Later snoozes for 7 days', async () => {
  const ctx = ready();
  nextChoice = 'Later';
  const before = Date.now();
  await maybePromptForReview(ctx);
  const until = ctx.store.get('anime.review.snoozeUntil');
  assert.ok(until >= before + 7 * DAY - 1000 && until <= Date.now() + 7 * DAY + 1000);
  await maybePromptForReview(ctx);
  assert.equal(shown.length, 1);
});

test("Don't Ask Again stops prompts permanently", async () => {
  const ctx = ready();
  nextChoice = "Don't Ask Again";
  await maybePromptForReview(ctx);
  assert.equal(ctx.store.get('anime.review.state'), 'never');
  await maybePromptForReview(ctx);
  assert.equal(shown.length, 1);
  assert.equal(opened.length, 0);
});
