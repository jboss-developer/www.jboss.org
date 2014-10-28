require 'aweplug/helpers/searchisko'
require 'parallel'

module JBoss
  module Developer
    class Connectors

      def initialize

      end

      def execute site
        searchisko = Aweplug::Helpers::Searchisko.default site, 0

        Parallel.each(site.fuse_connectors, in_threads: 40) do |(id, data)|

          searchisko_hash = data.collect { |(key, value)|

            case key
            when 'name'
              ['sys_title', value]
            when 'short_description'
              ['sys_description', value]
            when 'long_description'
              ['sys_content', value]
            else
              [key, value]
            end
          }.to_h.merge({'sys_url_view' => "#{site.base_url}/products/fuse/connectors#!id=#{id}",})

          searchisko.push_content('jbossdeveloper_connector',
                        id,
                        searchisko_hash.to_json)

        end
      end

    end
  end
end
