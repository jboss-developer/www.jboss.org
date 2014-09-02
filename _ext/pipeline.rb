require 'zurb-foundation'
require 'tilt/kramdown'

require 'common_dir'
require 'aweplug/extensions/kramdown_quickstart'
require 'aweplug/extensions/sections'
require 'aweplug/extensions/asciidoc_example'
require 'aweplug/extensions/video'
require 'aweplug/helpers/video'
require 'aweplug/helpers/resources'
require 'aweplug/transformers/asciidoc_cdn_transformer'
require 'aweplug/extensions/kramdown_demo'
require 'aweplug/extensions/google_spreadsheet'
require 'jboss_developer'
require 'nav'
require 'stacks'
require 'product'
require 'mktg_ops'
require 'disqus'
require 'disqus_more'
require 'lower_case_paths'
require 'customer_portal'

Awestruct::Extensions::Pipeline.new do
  
  # Needs to be at the top so that we fix all output paths before processing starts
  extension JBoss::Developer::Extensions::LowerCasePaths.new

  # parse AsciiDoc documents and create page variables out of their sections
  extension Aweplug::Extensions::Sections.new

  # Load events from a google spreadsheet
  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'events',
                                                       key: '12ZRFSz8TAay-GnNuF_5LipICmuns-HB_RcjGEPDi67k',
                                                       worksheet_title: 'Events',
                                                       col_labels: true,
                                                       by: 'row')

  # Load vimeo videos from a google spreadsheet
  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'vimeo',
                                                       key: '1QbjVeU9avP8hcnaruiLtuanQVpkdClIYtgFSmaC_K9c',
                                                       worksheet_title: 'Vimeo Videos',
                                                       col_labels: true,
                                                       by: 'row')
  extension Aweplug::Extensions::Video.new("site.vimeo.collect {|i,v| v['vimeo_url']}")

  # Load youtube videos from a google spreadsheet
  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'youtube',
                                                       key: '1QbjVeU9avP8hcnaruiLtuanQVpkdClIYtgFSmaC_K9c',
                                                       worksheet_title: 'YouTube Videos',
                                                       col_labels: true,
                                                       by: 'row')
  extension Aweplug::Extensions::Video.new("site.youtube.collect {|i,v| v['youtube_url']}")

  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'books',
                                                       key: '1QdE32458GN8v-sDGOqoBx5RJ3X44P_W-umxsCHMxL0g',
                                                       worksheet_title: 'Books',
                                                       col_labels: true,
                                                       by: 'row')

  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'customer_portal_articles',
                                                       key: '1440-gFstcyCyFhXISvTIlzrmXZo7Ligs-hla5z9eSQA',
                                                       worksheet_title: 'Customer Portal Articles',
                                                       col_labels: true,
                                                       by: 'row')

  extension Aweplug::Extensions::GoogleSpreadsheet.new(assign_to: 'customer_portal_solutions',
                                                       key: '1440-gFstcyCyFhXISvTIlzrmXZo7Ligs-hla5z9eSQA',
                                                       worksheet_title: 'Customer Portal Solutions',
                                                       col_labels: true,
                                                       by: 'row')

  extension JBoss::Developer::CustomerPortal.new

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_eap-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/eap',
                                                          excludes: ['_eap-quickstarts/template'],
                                                          product: 'eap')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_brms-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/brms',
                                                          excludes: ['_brms-quickstarts/template'],
                                                          product: 'brms')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_jdg-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/datagrid',
                                                          excludes: ['_jdg-quickstarts/template'],
                                                          product: 'datagrid')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_jon-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/operationsnetwork',
                                                          excludes: ['_jon-quickstarts/template'],
                                                          product: 'operationsnetwork')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_picketlink-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          excludes: ['_picketlink-quickstarts/template'],
                                                          experimental: true,
                                                          output_dir: '/quickstarts/picketlink')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_portal-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/portal',
                                                          excludes: ['_portal-quickstarts/template'],
                                                          product: 'portal')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_sandbox-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          excludes: ['_sandbox-quickstarts/template'],
                                                          experimental: true,
                                                          output_dir: '/quickstarts/sandbox')

  extension Aweplug::Extensions::Kramdown::Quickstart.new(repository: '_wfk-quickstarts', 
                                                          layout: 'get-started-item', 
                                                          output_dir: '/quickstarts/wfk',
                                                          excludes: ['_wfk-quickstarts/template'],
                                                          product: 'wfk')

  extension JBoss::Developer::Extensions::Stacks.new 'stacks.yaml', 'get-started-item', '_jdf-stack'
  extension JBoss::Developer::Extensions::AsciidoctorExtensionRegister.new
  
  extension Aweplug::Extensions::AsciidocExample.new(repository: '_ticket-monster', 
                                                     directory: 'tutorial', 
                                                     layout:'get-started-item', 
                                                     output_dir: 'ticket-monster', 
                                                     additional_excludes: ['ticket-monster.asciidoc'], 
                                                     additional_metadata_keys: ['thumbnail'],
                                                     push_to_searchisko: true)

  extension Aweplug::Extensions::Kramdown::Demo.new(url: 'https://raw.githubusercontent.com/jboss-developer/jboss-developer-demos/master/demos.yaml',
                                                    layout: 'get-started-item',
                                                    output_dir: '/demos',
                                                    push_to_searchisko: true)

  # Load indexifier
  extension Awestruct::Extensions::Indexifier.new [/google4775292ed26aeefd.html/]

  extension JBoss::Developer::Extensions::Nav.new
 
  extension JBoss::Developer::Extensions::CommonDir.new
  # Must be loaded after CommonDir
  extension JBoss::Developer::Extensions::Product.new

  # Pushes compass: config from site.yml -> compass
  extension JBoss::Developer::Utilities::CompassConfigurator.new

  # Generate a sitemap.xml
  extension Awestruct::Extensions::Sitemap.new
  # Generate a assets.yml
  extension JBoss::Developer::MktgOps::Assets.new

  extension Awestruct::Extensions::Disqus.new

  helper Awestruct::Extensions::Partial
  helper JBoss::Developer::Utilities
  helper Aweplug::Helpers::Video
  helper Aweplug::Helpers::Resources

  transformer JBoss::Developer::LinkTransformer.new
  transformer Aweplug::Transformer::AsciidocCdnTransformer.new
end

