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
import * as migration_20260712_070000_woo_import_ledger from './20260712_070000_woo_import_ledger'
import * as migration_20260712_080000_inventory_reservations from './20260712_080000_inventory_reservations'
import * as migration_20260712_090000_catalogue_fact_backfill from './20260712_090000_catalogue_fact_backfill'
import * as migration_20260712_100000_custom_quote_domain from './20260712_100000_custom_quote_domain'
import * as migration_20260712_110000_custom_quote_delivery from './20260712_110000_custom_quote_delivery'
import * as migration_20260712_120100_course_public_syllabus from './20260712_120100_course_public_syllabus'
import * as migration_20260712_131000_builder_mapping_lifecycle from './20260712_131000_builder_mapping_lifecycle'
import * as migration_20260712_143000_heart_silhouette from './20260712_143000_heart_silhouette'
import * as migration_20260712_150000_catalogue_builder_approval from './20260712_150000_catalogue_builder_approval'
import * as migration_20260712_160000_white_opal_crop_alignment from './20260712_160000_white_opal_crop_alignment'
import * as migration_20260712_161000_stone_only_crop_alignment from './20260712_161000_stone_only_crop_alignment'
import * as migration_20260712_162000_heart_stone_only_crop from './20260712_162000_heart_stone_only_crop'

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
  {
    up: migration_20260712_070000_woo_import_ledger.up,
    down: migration_20260712_070000_woo_import_ledger.down,
    name: '20260712_070000_woo_import_ledger',
  },
  {
    up: migration_20260712_080000_inventory_reservations.up,
    down: migration_20260712_080000_inventory_reservations.down,
    name: '20260712_080000_inventory_reservations',
  },
  {
    up: migration_20260712_090000_catalogue_fact_backfill.up,
    down: migration_20260712_090000_catalogue_fact_backfill.down,
    name: '20260712_090000_catalogue_fact_backfill',
  },
  {
    up: migration_20260712_100000_custom_quote_domain.up,
    down: migration_20260712_100000_custom_quote_domain.down,
    name: '20260712_100000_custom_quote_domain',
  },
  {
    up: migration_20260712_110000_custom_quote_delivery.up,
    down: migration_20260712_110000_custom_quote_delivery.down,
    name: '20260712_110000_custom_quote_delivery',
  },
  {
    up: migration_20260712_120100_course_public_syllabus.up,
    down: migration_20260712_120100_course_public_syllabus.down,
    name: '20260712_120100_course_public_syllabus',
  },
  {
    up: migration_20260712_131000_builder_mapping_lifecycle.up,
    down: migration_20260712_131000_builder_mapping_lifecycle.down,
    name: '20260712_131000_builder_mapping_lifecycle',
  },
  {
    up: migration_20260712_143000_heart_silhouette.up,
    down: migration_20260712_143000_heart_silhouette.down,
    name: '20260712_143000_heart_silhouette',
  },
  {
    up: migration_20260712_150000_catalogue_builder_approval.up,
    down: migration_20260712_150000_catalogue_builder_approval.down,
    name: '20260712_150000_catalogue_builder_approval',
  },
  {
    up: migration_20260712_160000_white_opal_crop_alignment.up,
    down: migration_20260712_160000_white_opal_crop_alignment.down,
    name: '20260712_160000_white_opal_crop_alignment',
  },
  {
    up: migration_20260712_161000_stone_only_crop_alignment.up,
    down: migration_20260712_161000_stone_only_crop_alignment.down,
    name: '20260712_161000_stone_only_crop_alignment',
  },
  {
    up: migration_20260712_162000_heart_stone_only_crop.up,
    down: migration_20260712_162000_heart_stone_only_crop.down,
    name: '20260712_162000_heart_stone_only_crop',
  },
]
