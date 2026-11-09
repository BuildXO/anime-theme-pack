import * as vscode from 'vscode';

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

const REVIEW_URL =
  'https://marketplace.visualstudio.com/items?itemName=LunaCode.anime-theme&ssr=false#review-details';

/**
 * Show a dismissible Marketplace review request (at most once per snooze window) once the extension
 * has seen some real use. Never blocks activation, stops for good after the
 * user rates or opts out, and snoozes quietly on "Later".
 */
export async function maybePromptForReview(
  context: vscode.ExtensionContext
): Promise<void> {
  try {
    const state = context.globalState.get<string>(STATE_KEY);
    if (state === 'done' || state === 'never') {
      return;
    }

    const now = Date.now();

    let installDate = context.globalState.get<number>(INSTALL_DATE_KEY);
    if (!installDate) {
      installDate = now;
      await context.globalState.update(INSTALL_DATE_KEY, installDate);
    }

    const activations =
      (context.globalState.get<number>(ACTIVATION_COUNT_KEY) ?? 0) + 1;
    await context.globalState.update(ACTIVATION_COUNT_KEY, activations);

    const snoozeUntil = context.globalState.get<number>(SNOOZE_UNTIL_KEY) ?? 0;
    const oldEnough = now - installDate >= MIN_DAYS_INSTALLED * DAY_MS;

    if (!oldEnough || activations < MIN_ACTIVATIONS || now < snoozeUntil) {
      return;
    }

    const choice = await vscode.window.showInformationMessage(
      'Enjoying Anime Theme Pack? A quick rating on the Marketplace helps other anime fans find it.',
      'Rate on Marketplace',
      'Later',
      "Don't Ask Again"
    );

    if (choice === 'Rate on Marketplace') {
      await context.globalState.update(STATE_KEY, 'done');
      vscode.env.openExternal(vscode.Uri.parse(REVIEW_URL));
    } else if (choice === 'Later') {
      await context.globalState.update(SNOOZE_UNTIL_KEY, now + SNOOZE_DAYS * DAY_MS);
    } else if (choice === "Don't Ask Again") {
      await context.globalState.update(STATE_KEY, 'never');
    }
  } catch (error) {
    console.error('[Anime Theme] Review prompt failed:', error);
  }
}
