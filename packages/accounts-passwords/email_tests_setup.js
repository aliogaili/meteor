(function () {
  //
  // a mechanism to intercept emails sent to addressing including
  // the string "intercept", storing them in an array that can then
  // be retrieved using the getInterceptedEmails method
  //
  var oldMeteorMailSend = Meteor.mail.send;
  var interceptedEmails = {}; // (email address) -> (array of contents)

  Meteor.mail.send = function (email, content) {
    if (email.indexOf('intercept') === -1) {
      oldMeteorMailSend(email, content);
    } else {
      if (!interceptedEmails[email])
        interceptedEmails[email] = [];

      interceptedEmails[email].push(content);
    }
  };

  Meteor.methods({
    getInterceptedEmails: function (email) {
      return interceptedEmails[email];
    },

    addEmailForTestAndValidate: function (email, appBaseUrl) {
      Meteor.users.update(
        {_id: this.userId()},
        {$push: {emails: {email: email, validated: false}}});
      Meteor.accounts.sendValidationEmail(this.userId(), email, appBaseUrl);
    },

    createUserOnServer: function (email) {
      var userId = Meteor.createUser({email: email});
      return Meteor.users.findOne(userId);
    }
  });
}) ();