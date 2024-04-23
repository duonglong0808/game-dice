export const messageResponse = {
  system: {
    badRequest: 'bad_request',
    emailNotInvalid: 'email_invalid',
    phoneNumberInvalid: 'phone_number_invalid',
    missingData: 'missing_data',
    notFound: 'not_found',
    duplicateData: 'duplicate_data',
    idInvalid: 'id_invalid',
    dataInvalid: 'data_invalid',
  },
  auth: {
    userNotFound: 'user_not_found',
    password_wrong: 'password_wrong',
  },
  diceDetail: {
    transactionIsRunning: 'transaction_dice_is_running',
    transactionIsFinished: 'transaction_dice_is_finished',
  },
  historyPlay: {
    transactionIsFinished: 'transaction_is_finished',
    positionHasChoice: 'position_has_choice',
  },
};
