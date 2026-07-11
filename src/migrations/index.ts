import * as migration_20260710_234136_production_baseline from './20260710_234136_production_baseline'
import * as migration_20260711_003007_newsletter_security from './20260711_003007_newsletter_security'
import * as migration_20260711_003719_order_delivery_security from './20260711_003719_order_delivery_security'
import * as migration_20260711_005753_inventory_alert_delivery from './20260711_005753_inventory_alert_delivery'
import * as migration_20260711_005845_newsletter_delivery_state from './20260711_005845_newsletter_delivery_state'
import * as migration_20260711_052518_woocommerce_legacy_commerce from './20260711_052518_woocommerce_legacy_commerce'
import * as migration_20260711_061701 from './20260711_061701'
import * as migration_20260711_063824_wordpress_content from './20260711_063824_wordpress_content'
import * as migration_20260711_080000_stripe_refund_accounting from './20260711_080000_stripe_refund_accounting'
import * as migration_20260711_181055_blog_publication_state from './20260711_181055_blog_publication_state'
import * as migration_20260711_190000_enquiry_pipeline from './20260711_190000_enquiry_pipeline'
import * as migration_20260711_213000_optional_international_address from './20260711_213000_optional_international_address'
import * as migration_20260711_213100_certification_claim_integrity from './20260711_213100_certification_claim_integrity'
import * as migration_20260711_223000_course_education from './20260711_223000_course_education'
import * as migration_20260712_013000_order_operations_hardening from './20260712_013000_order_operations_hardening'
import * as migration_20260712_042253_blog_editorial_taxonomy from './20260712_042253_blog_editorial_taxonomy'
import * as migration_20260712_043000_course_interest_truth from './20260712_043000_course_interest_truth'
import * as migration_20260712_060000_builder_visual_management from './20260712_060000_builder_visual_management'

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
    name: '20260711_061701',
  },
  {
    up: migration_20260711_063824_wordpress_content.up,
    down: migration_20260711_063824_wordpress_content.down,
    name: '20260711_063824_wordpress_content',
  },
  {
    up: migration_20260711_080000_stripe_refund_accounting.up,
    down: migration_20260711_080000_stripe_refund_accounting.down,
    name: '20260711_080000_stripe_refund_accounting',
  },
  {
    up: migration_20260711_181055_blog_publication_state.up,
    down: migration_20260711_181055_blog_publication_state.down,
    name: '20260711_181055_blog_publication_state',
  },
  {
    up: migration_20260711_190000_enquiry_pipeline.up,
    down: migration_20260711_190000_enquiry_pipeline.down,
    name: '20260711_190000_enquiry_pipeline',
  },
  {
    up: migration_20260711_213000_optional_international_address.up,
    down: migration_20260711_213000_optional_international_address.down,
    name: '20260711_213000_optional_international_address',
  },
  {
    up: migration_20260711_213100_certification_claim_integrity.up,
    down: migration_20260711_213100_certification_claim_integrity.down,
    name: '20260711_213100_certification_claim_integrity',
  },
  {
    up: migration_20260711_223000_course_education.up,
    down: migration_20260711_223000_course_education.down,
    name: '20260711_223000_course_education',
  },
  {
    up: migration_20260712_013000_order_operations_hardening.up,
    down: migration_20260712_013000_order_operations_hardening.down,
    name: '20260712_013000_order_operations_hardening',
  },
  {
    up: migration_20260712_042253_blog_editorial_taxonomy.up,
    down: migration_20260712_042253_blog_editorial_taxonomy.down,
    name: '20260712_042253_blog_editorial_taxonomy',
  },
  {
    up: migration_20260712_043000_course_interest_truth.up,
    down: migration_20260712_043000_course_interest_truth.down,
    name: '20260712_043000_course_interest_truth',
  },
  {
    up: migration_20260712_060000_builder_visual_management.up,
    down: migration_20260712_060000_builder_visual_management.down,
    name: '20260712_060000_builder_visual_management',
  },
]
