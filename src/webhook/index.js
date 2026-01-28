/** @format */

const stripe = require("stripe");

class Webhook {
  handle = async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK
      );
    } catch (err) {
      console.log(err);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    const payment_intent = event.data.object;

    try {
      if (event.type === "payment_intent.succeeded") {
        // await job_service.confirm_job_paid_by_creator({
        //   data: payment_intent.metadata,
        // });
        // console.log(
        //   `payment successfuly made by user against job_id: ${payment_intent.metadata.job_id}`
        // );
      } else if (event.type === "payment_intent.payment_failed") {
        // await job_service.unsussfully_handle_payment({
        //   data: payment_intent.metadata,
        // });
        // console.log(
        //   `payment not successfuly made by user against job_id: ${payment_intent.metadata.job_id}`
        // );
      }

      response.json({ received: true });
    } catch (error) {
      console.log(error, "error");
    }
  };
}

module.exports = Webhook;
