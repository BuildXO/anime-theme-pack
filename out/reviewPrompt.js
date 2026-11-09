"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybePromptForReview = maybePromptForReview;
const vscode = __importStar(require("vscode"));
// Marketplace review prompt state (globalState keys)
const INSTALL_DATE_KEY = 'anime.review.installDate';
const ACTIVATION_COUNT_KEY = 'anime.review.activationCount';
const STATE_KEY = 'anime.review.state'; // 'done' | 'never'
const SNOOZE_UNTIL_KEY = 'anime.review.snoozeUntil';
// Prompt only after the extension has actually been used for a while:
// at least 7 days since first activation of this build, at least 10
// activations, and never more than once per snooze window.
const MIN_DAYS_INSTALLED = 7;
const MIN_ACTIVATIONS = 10;
const SNOOZE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_URL = 'https://marketplace.visualstudio.com/items?itemName=LunaCode.anime-theme&ssr=false#review-details';
/**
 * Show a dismissible Marketplace review request (at most once per snooze window) once the extension
 * has seen some real use. Never blocks activation, stops for good after the
 * user rates or opts out, and snoozes quietly on "Later".
 */
async function maybePromptForReview(context) {
    try {
        const state = context.globalState.get(STATE_KEY);
        if (state === 'done' || state === 'never') {
            return;
        }
        const now = Date.now();
        let installDate = context.globalState.get(INSTALL_DATE_KEY);
        if (!installDate) {
            installDate = now;
            await context.globalState.update(INSTALL_DATE_KEY, installDate);
        }
        const activations = (context.globalState.get(ACTIVATION_COUNT_KEY) ?? 0) + 1;
        await context.globalState.update(ACTIVATION_COUNT_KEY, activations);
        const snoozeUntil = context.globalState.get(SNOOZE_UNTIL_KEY) ?? 0;
        const oldEnough = now - installDate >= MIN_DAYS_INSTALLED * DAY_MS;
        if (!oldEnough || activations < MIN_ACTIVATIONS || now < snoozeUntil) {
            return;
        }
        const choice = await vscode.window.showInformationMessage('Enjoying Anime Theme Pack? A quick rating on the Marketplace helps other anime fans find it.', 'Rate on Marketplace', 'Later', "Don't Ask Again");
        if (choice === 'Rate on Marketplace') {
            await context.globalState.update(STATE_KEY, 'done');
            vscode.env.openExternal(vscode.Uri.parse(REVIEW_URL));
        }
        else if (choice === 'Later') {
            await context.globalState.update(SNOOZE_UNTIL_KEY, now + SNOOZE_DAYS * DAY_MS);
        }
        else if (choice === "Don't Ask Again") {
            await context.globalState.update(STATE_KEY, 'never');
        }
    }
    catch (error) {
        console.error('[Anime Theme] Review prompt failed:', error);
    }
}
//# sourceMappingURL=reviewPrompt.js.map