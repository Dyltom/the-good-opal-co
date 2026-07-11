import * as migration_20260710_234136_production_baseline from './20260710_234136_production_baseline';
import * as migration_20260711_003007_newsletter_security from './20260711_003007_newsletter_security';
import * as migration_20260711_003719_order_delivery_security from './20260711_003719_order_delivery_security';
import * as migration_20260711_005753_inventory_alert_delivery from './20260711_005753_inventory_alert_delivery';
import * as migration_20260711_005845_newsletter_delivery_state from './20260711_005845_newsletter_delivery_state';
import * as migration_20260711_052518_woocommerce_legacy_commerce from './20260711_052518_woocommerce_legacy_commerce';
import * as migration_20260711_061701 from './20260711_061701';
import * as migration_20260711_063824_wordpress_content from './20260711_063824_wordpress_content';

export const migrations = [
  {
    up: migration_20260710_234136_production_baseline.up,
    down: migration_20260710_234136_production_baseline.down,
    name: '20260710_234136_production_baseline',
  },
  {
    up: migration_20260711_003007_newsletter_security.up,
    down: migration_20260711_003007_newsletter_security.down,
    name: '20260711_003007_newsletter_security',
  },
  {
    up: migration_20260711_003719_order_delivery_security.up,
    down: migration_20260711_003719_order_delivery_security.down,
    name: '20260711_003719_order_delivery_security',
  },
  {
    up: migration_20260711_005753_inventory_alert_delivery.up,
    down: migration_20260711_005753_inventory_alert_delivery.down,
    name: '20260711_005753_inventory_alert_delivery',
  },
  {
    up: migration_20260711_005845_newsletter_delivery_state.up,
    down: migration_20260711_005845_newsletter_delivery_state.down,
    name: '20260711_005845_newsletter_delivery_state',
  },
  {
    up: migration_20260711_052518_woocommerce_legacy_commerce.up,
    down: migration_20260711_052518_woocommerce_legacy_commerce.down,
    name: '20260711_052518_woocommerce_legacy_commerce',
  },
  {
    up: migration_20260711_061701.up,
    down: migration_20260711_061701.down,
    name: '20260711_061701'
  },
  {
    up: migration_20260711_063824_wordpress_content.up,
    down: migration_20260711_063824_wordpress_content.down,
    name: '20260711_063824_wordpress_content',
  },
];
