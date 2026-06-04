import { Controller, Post, Body, Headers, Req, Logger, RawBodyRequest } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
const Stripe = require('stripe');

@Controller('api/v1/webhooks/stripe')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private stripe: any;

  constructor(private readonly db: DatabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
      apiVersion: '2025-01-27.acacia',
    });
  }

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    let event: any;

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (endpointSecret && signature) {
      try {
        event = this.stripe.webhooks.constructEvent(
          req.rawBody || JSON.stringify(payload),
          signature,
          endpointSecret
        );
      } catch (err) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`);
        return { error: 'Invalid signature' };
      }
    } else {
      event = payload;
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionUpdated(subscription: any) {
    await this.db.run(
      `UPDATE practice_subscriptions 
       SET status = '${subscription.status}', 
           current_period_end = datetime(${subscription.current_period_end}, 'unixepoch')
       WHERE stripe_subscription_id = '${subscription.id}'`
    );
  }

  private async handleSubscriptionDeleted(subscription: any) {
    await this.db.run(
      `UPDATE practice_subscriptions 
       SET status = 'canceled'
       WHERE stripe_subscription_id = '${subscription.id}'`
    );
  }

  private async handleInvoicePaid(invoice: any) {
    this.logger.log(`Invoice ${invoice.id} paid for customer ${invoice.customer}`);
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    this.logger.error(`Invoice ${invoice.id} payment failed for customer ${invoice.customer}`);
    if (invoice.subscription) {
      await this.db.run(
        `UPDATE practice_subscriptions 
         SET status = 'past_due'
         WHERE stripe_subscription_id = '${invoice.subscription}'`
      );
    }
  }

  private async handleAccountUpdated(account: any) {
    await this.db.run(
      `UPDATE practices 
       SET is_billing_setup = ${account.details_submitted ? 1 : 0}
       WHERE stripe_account_id = '${account.id}'`
    );
  }
}
