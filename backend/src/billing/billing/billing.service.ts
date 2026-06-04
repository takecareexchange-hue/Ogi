import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
const Stripe = require('stripe');

@Injectable()
export class BillingService implements OnModuleInit {
  private readonly logger = new Logger(BillingService.name);
  private stripe: any;

  constructor(private readonly db: DatabaseService) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2025-01-27.acacia',
    });
  }

  onModuleInit() {
    this.startUsageSyncWorker();
  }

  async createCustomer(practiceId: string, email: string, name: string) {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { practiceId },
    });

    await this.db.run(
      `UPDATE practices SET stripe_customer_id = '${customer.id}' WHERE id = '${practiceId}'`,
    );

    return customer;
  }

  async createSubscription(practiceId: string, planId: string) {
    const practice = await this.db.query(
      `SELECT stripe_customer_id FROM practices WHERE id = '${practiceId}'`,
    );

    if (!practice[0]?.stripe_customer_id) {
      throw new Error('Practice does not have a Stripe Customer ID');
    }

    const plan = await this.db.query(
      `SELECT stripe_price_id FROM subscription_plans WHERE id = '${planId}'`,
    );

    if (!plan[0]?.stripe_price_id) {
      throw new Error('Plan does not have a Stripe Price ID');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: practice[0].stripe_customer_id,
      items: [
        { price: plan[0].stripe_price_id },
        { price: process.env.STRIPE_PPR_PRICE_ID || 'price_mock_ppr' },
      ],
    });

    await this.db.run(
      `INSERT INTO practice_subscriptions (practice_id, plan_id, stripe_subscription_id, status, current_period_end)
       VALUES ('${practiceId}', '${planId}', '${subscription.id}', '${subscription.status}', datetime(${subscription.current_period_end}, 'unixepoch'))`,
    );

    return subscription;
  }

  async createConnectAccount(practiceId: string, email: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { practiceId },
    });

    await this.db.run(
      `UPDATE practices SET stripe_account_id = '${account.id}' WHERE id = '${practiceId}'`,
    );

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://ogi-platform.com/reauth',
      return_url: 'https://ogi-platform.com/return',
      type: 'account_onboarding',
    });

    return accountLink;
  }

  async syncUsageToStripe() {
    const pendingEvents = await this.db.query(
      `SELECT bue.*, ps.stripe_subscription_id 
       FROM billing_usage_events bue
       JOIN practice_subscriptions ps ON bue.practice_id = ps.practice_id
       WHERE bue.status = 'pending_sync' AND ps.status = 'active'`,
    );

    for (const event of pendingEvents) {
      try {
        const subscription = await this.stripe.subscriptions.retrieve(event.stripe_subscription_id);
        const meteredItem = subscription.items.data.find(
          (item: any) => item.price.id === (process.env.STRIPE_PPR_PRICE_ID || 'price_mock_ppr')
        );

        if (!meteredItem) {
          this.logger.error(`No metered item found for subscription ${event.stripe_subscription_id}`);
          continue;
        }

        const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(
          meteredItem.id,
          {
            quantity: 1,
            timestamp: Math.floor(new Date(event.created_at).getTime() / 1000),
            action: 'increment',
          },
          {
            idempotencyKey: event.idempotency_key,
          }
        );

        await this.db.run(
          `UPDATE billing_usage_events 
           SET status = 'synced', stripe_usage_record_id = '${usageRecord.id}' 
           WHERE id = '${event.id}'`,
        );

        this.logger.log(`Synced usage for event ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to sync usage for event ${event.id}`, error);
        await this.db.run(
          `UPDATE billing_usage_events SET status = 'failed' WHERE id = '${event.id}'`
        );
      }
    }
  }

  private startUsageSyncWorker() {
    setInterval(() => {
      this.syncUsageToStripe().catch(err => this.logger.error('Usage Sync Worker failed', err));
    }, 3600000);
    
    setTimeout(() => {
      this.syncUsageToStripe().catch(err => this.logger.error('Initial Usage Sync failed', err));
    }, 10000);
  }
}
