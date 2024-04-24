declare global {
  /**
   * Add confirmation when someone proposes a match on the recommendation page
   */
  var __CONFIRM_PROPOSAL__: boolean;

  /**
   * Add confirmation when cancelling a match
   */
  var __CONFIRM_CANCEL__: boolean;

  /**
   * Update the availability to work be based around setting availability for
   * specific days in a week
   */
  var __SHOW_ALT_AVAIL__: boolean;
}

export {};
