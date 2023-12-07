const SibApiV3Sdk = require("sib-api-v3-sdk");

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let apiSendInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

let apiContactInstance = new SibApiV3Sdk.ContactsApi();

let createContact = new SibApiV3Sdk.CreateContact();


module.exports = {
  sendActivationEmail: async (user, activationLink) => {
    try {
      createContact.email = user.email;
      createContact.attributes = {
        FIRSTNAME: user.firstName,
        LASTNAME: user.lastName,
        ACTIVATION_LINK: activationLink,
      };
      console.log(activationLink);
      await apiContactInstance.createContact(
        createContact
      );

      sendSmtpEmail.subject = "Activate your account";
      sendSmtpEmail.templateId = 2;
      sendSmtpEmail.to = [{ name: user.firstName, email: user.email }];
      sendSmtpEmail.replyTo = { email: process.env.email, name: "My Reads" };
      sendSmtpEmail.params = {
        "FIRSTNAME ": user.firstName,
        ACTIVATION_LINK: activationLink,
      };
      await apiSendInstance.sendTransacEmail(
        sendSmtpEmail
      );
    } catch (error) {
      throw error;
    }
  },
  
  resendActivationEmail: async(user, activationLink) => {
    try {
      sendSmtpEmail.subject = "Activate your account";
      sendSmtpEmail.templateId = 2;
      sendSmtpEmail.to = [{ name: user.firstName, email: user.email }];
      sendSmtpEmail.replyTo = { email: process.env.email, name: "My Reads" };
      sendSmtpEmail.params = {
        "FIRSTNAME ": user.firstName,
        ACTIVATION_LINK: activationLink,
      };
      const sendEmailResponse = await apiSendInstance.sendTransacEmail(
        sendSmtpEmail
      );
    } catch (error) {
      throw error;
    }
  },

  sendResetPasswordEmail: async (user, newPassword) => {
    try {
     
      sendSmtpEmail.subject = "Retrieve your password";
      sendSmtpEmail.templateId = 3;
      sendSmtpEmail.to = [{ name: user.firstName, email: user.email }];
      sendSmtpEmail.replyTo = { email: process.env.email, name: "My Reads" };
      sendSmtpEmail.params = {
        "FIRSTNAME": user.firstName,
        RETRIEVED_PASSWORD: newPassword,
      };
      const sendEmailResponse = await apiSendInstance.sendTransacEmail(
        sendSmtpEmail
      );
       return sendEmailResponse;
    } catch (error) {
      throw error;
    }
  },
};
