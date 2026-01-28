/** @format */

const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const responses = new Responses();

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  mark_verified = async ({ stripe_account_id }) => {
    return await prisma.user_details.update({
      where: {
        stripe_account_id,
      },
      data: {
        is_stripe_verified: true,
      },
    });
  };

  user_stripe_details = async ({ user_id }) => {
    return await prisma.users.findUnique({
      where: {
        id: user_id,
      },
      select: {
        user_details: {
          select: {
            stripe_account_id: true,
            is_stripe_verified: true,
          },
        },
      },
    });
  };

  create_customer = async ({ email, name }) => {
    const customer = await this.stripe.customers.create({
      name,
      email,
    });

    return customer;
  };

  create_connected_account = async ({ email }) => {
    const account = await this.stripe.accounts.create({
      type: "custom",
      country: "US",
      email,
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });
    return account.id;
  };

  verify_connected_account = async ({ user_id }) => {
    const account = await this.user_stripe_details({
      user_id: user_id,
    });

    if (account.user_details.is_stripe_verified) return;

    const account_link = await this.stripe.accountLinks.create({
      account: account.user_details.stripe_account_id,
      refresh_url: "http://localhost:3000/reauth",
      return_url: `http://localhost:9000/api/v1/transaction/verify_stripe?account_id=${account.user_details.stripe_account_id}`,
      type: "account_onboarding",
    });
    return account_link.url;
  };

  accept_term_and_conditions = async ({ accountId }) => {
    const date = Math.floor(new Date().getTime() / 1000);
    console.log(date);
    const account = await this.stripe.accounts.update(accountId, {
      tos_acceptance: {
        date,
        ip: "8.8.8.8",
      },
    });
    return account;
  };

  getAccountDetails = async ({ accountId }) => {
    const account = await this.stripe.accounts.retrieve(accountId);
    return account;
  };

  create_external_bank_account = async ({
    account_number,
    routing_number,
    user_id,
  }) => {
    const account = await this.user_stripe_details({
      user_id,
    });

    if (!account.user_details.is_stripe_verified) return;

    const external_account = {
      account_number,
      routing_number,
      country: "US",
      currency: "usd",
      object: "bank_account",
    };

    const externalAccount = await this.stripe.accounts.createExternalAccount(
      account.user_details.stripe_account_id,
      { external_account }
    );
    return externalAccount;
  };

  get_all_bank_accounts = async ({ user_id }) => {
    const account = await this.user_stripe_details({
      user_id,
    });

    if (!account.user_details.is_stripe_verified)
      throw responses.bad_request_response("Please first connect your account");

    const externalAccounts = await this.stripe.accounts.listExternalAccounts(
      account.user_details.stripe_account_id,
      {
        object: "bank_account",
      }
    );
    return externalAccounts;
  };

  delete_external_bank_account = async ({ user_id, bank_id }) => {
    const account = await this.user_stripe_details({
      user_id,
    });

    const deleted = await this.stripe.accounts.deleteExternalAccount(
      account.user_details.stripe_account_id,
      bank_id
    );

    return deleted;
  };

  create_payout = async ({ amount, destination, user_id }) => {
    const account = await this.user_stripe_details({
      user_id,
    });

    const payout = await this.stripe.payouts.create(
      {
        amount,
        currency: "usd",
        source_type: "card",
        destination,
      },
      {
        stripeAccount: account.user_details.stripe_account_id,
      }
    );

    return payout;
  };

  get_personal_balance = async ({ user_id, user_type }) => {
    if (user_type === "USER") {
      const balance = await prisma.user_details.findFirst({
        where: {
          user_id,
        },
        select: {
          refunded_balance: true,
        },
      });

      return balance.refunded_balance;
    }
    const account = await this.user_stripe_details({
      user_id,
    });

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: account.user_details.stripe_account_id,
    });
    return balance;
  };

  getBalanceTransactions = async ({ account_id }) => {
    const balanceTransactions = await this.stripe.payouts.list({
      destination: account_id,
    });
    return balanceTransactions;
  };

  create_payment_intend = async ({ amount, metadata, customer }) => {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer,
      setup_future_usage: "off_session",
      metadata,
    });

    return paymentIntent;
  };

  create_business_transfer = async ({
    amount,
    metadata,
    connectedAccountId,
  }) => {
    const transfer = await this.stripe.transfers.create({
      amount,
      currency: "usd",
      destination: connectedAccountId,
      metadata,
    });

    return transfer;
  };

  create_business_reverse_transfer = async ({ amount, transfer_id }) => {
    const transferReversal = await this.stripe.transfers.createReversal(
      transfer_id,
      {
        amount,
      }
    );

    return transferReversal;
  };

  convert_enum_to_string = ({ data }) => {
    const enums = {
      "business_profile.mcc": "Merchant Category Code (MCC)",
      "business_profile.url": "Website URL/details ",
      "individual.verification.document":
        "Provided identity information could not be verified (SSN)",
      business_type: "Type of Account",
      external_account: "External bank account details",
      "representative.dob.day": "Date of Birth",
      "representative.email": "Business Email",
      "representative.first_name": "Business first name",
      "representative.last_name": "Business last name",
      "settings.payments.statement_descriptor":
        "Statement descriptor for payments",
    };

    let fields = {};

    for (let i = 0; i < data.length; i++) {
      let string = enums[data[i]];
      if (string) {
        fields[data[i]] = string;
      }
    }

    const missing_fileds = Object.values(fields);

    return missing_fileds.length > 0
      ? [`${missing_fileds} are missing!`, true]
      : ["You have no missing requirements", false];
  };

  #url_maker = ({ web, user }) => {
    return web == "1"
      ? `http://localhost:3000/dashboard/service-provider/earning?account_id=${user.user_details.stripe_account_id}`
      : `${process.env.BACKEND_DOMAIN}/transaction/verify_stripe?account_id=${user.user_details.stripe_account_id} `;
  };

  check_account_restrictions = async ({ user_id, web }) => {
    const user = await this.user_stripe_details({
      user_id,
    });
    const restrictions = await this.stripe.accounts.retrieve(
      user.user_details.stripe_account_id
    );

    const [data, resend] = this.convert_enum_to_string({
      data: restrictions.requirements.currently_due,
    });

    const account_link = await this.stripe.accountLinks.create({
      account: user.user_details.stripe_account_id,
      refresh_url: `${process.env.BACKEND_DOMAIN}/transaction/reauth?account_id=${user.user_details.stripe_account_id}`,
      return_url: this.#url_maker({ web, user }),
      type: "account_onboarding",
    });

    return {
      message: data,
      url: resend ? account_link.url : null,
      is_fresh: !user.user_details.is_stripe_verified,
      is_missing: resend,
      is_completed: !resend && user.user_details.is_stripe_verified,
    };
  };
}
module.exports = { StripeService };
