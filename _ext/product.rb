require 'json'
require 'aweplug/helpers/searchisko'
require 'aweplug/helpers/video'

module JBoss
  module Developer
    module Extensions
      # Post-process product metadata from product.yml, applying conventions
      class Product
        include Aweplug::Helpers::Video

        def initialize push_to_searchisko: true
          @default_guide_formats = {"html" => {}, "html-single" => {}, "pdf" => {}, "epub" => {}}
          @default_download_assets = {
            "installer" => {"type" => "jar"},
            "zip" => {"name" => "ZIP", },
            "sha1" => {"name" => "SHA1", "type" => "sha1"},
            "md5" => {"name" => "MD5", "type" => "md5"}, 
            "release_notes" => {"name" => "Release Notes", "icon" => "fa fa-pencil", "type" => "txt"},
            "source" => {},
            "docker-tar" => {"icon" => "fa fa-docker", "type" => "tar", "name" => "Image"},
            "docker-src" => {"icon" => "fa fa-docker", "name" => "Build file"},
            "docker-readme" => {"name" => "README", "icon" => "fa fa-pencil", "type" => "txt"}
          }
          @default_locale = "en_US"
          @default_download_artifact_type = "zip"
          @push_to_searchisko = push_to_searchisko
        end


        def execute(site)
          articles = []
          solutions = []
          site.products = {}
          site.pages.each do |page|
            if page.product
              product = page.product
              id = page.parent_dir
              if not site.products.has_key? id
                # Set the product id to the parent dir
                product.id = id
                # Set the forum url to the default value, if not set
                if site.forums.has_key? product.id
                  product.forum_url = site.forums[product.id]['url']
                else
                  product.forum_url = ''
                end
                if product.current_version
                  # Set the product's current major.minor version
                  product.current_minor_version = product.current_version[/^([0-9]*\.[0-9]*)/, 1]
                end
                docs(product, site)
                downloads(product, site)
                product.buzz_tags ||= product.id
                add_video product.vimeo_album, site, product: id, push_to_searchisko: @push_to_searchisko if product.vimeo_album
                unless site.featured_videos[id].nil?
                  res = []
                  site.featured_videos[id].values.each do |url|
                    res << add_video(url, site, product: id, push_to_searchisko: @push_to_searchisko)
                  end
                  product.featured_videos = res.flatten.reject {|v| v.nil?}
                end
                # Store the product in the global product map
                site.products[product.id] = product
                page.send('featured_items=', product['featured_items'])
              end
            end
          end
        end

        def downloads(product, site)
          # Process the downloads declared for the product
          a = {}
          if product.downloads
            product.downloads.each do |k, v|
              download = OpenStruct.new(v)
              download.version ||= k.gsub(/_/, ' ').to_s
              download.minor_version = download.version[/^([0-9]*\.[0-9]*)/, 1]
              download.description ||= product.abbreviated_name
              download.release_date = download.release_date ? download.release_date : Date.today
              download.assets ||= @default_download_assets.clone
              b = {}
              download.assets.each do |l, w|
                asset = OpenStruct.new(w)
                asset.key = l
                asset.name ||= artifact_attr l, "name", key_to_name(l) 
                c = []
                if asset.artifacts
                  asset.artifacts.each do |m, x|
                    artifact = OpenStruct.new(x)
                    artifact.type ||= artifact_attr m, "type", "zip"
                    artifact.classifier ||= artifact_classifier l, m, artifact.type
                    artifact.name ||=  artifact_attr m, "name", key_to_name(m)
                    artifact.filename ||= "jboss-#{product.id}-#{download.version}#{artifact.classifier}.#{artifact.type}"
                    artifact.url ||= "#{site.download_manager_file_base_url}#{artifact.filename}"
                    artifact.icon ||= artifact_attr m, "icon", "fa fa-download"
                    c << artifact
                  end
                else
                  artifact = OpenStruct.new(w)
                  artifact.size = asset.size
                  artifact.type ||= artifact_attr l, "type", "zip"
                  artifact.name = asset.name
                  artifact.classifier ||= artifact_classifier l, l, artifact.type
                  artifact.filename ||= "jboss-#{product.id}-#{download.version}#{artifact.classifier}.#{artifact.type}"
                  if l == 'release_notes' && product.guides.has_key?('Release_Notes')
                    # Special case for release notes
                    artifact.url ||= "#{product.documentation_url}/#{download.minor_version}/html/#{release_notes_dir_name(download.version)}"
                  else
                    artifact.url ||= "#{site.download_manager_file_base_url}#{artifact.filename}"
                  end
                  artifact.icon ||= artifact_attr l, "icon", "fa fa-download"
                  c << artifact
                end
                asset.artifacts = c
                b[asset.key] = asset 
              end
              download.assets = b
              a[download.version] = download
            end
            product.default_download_artifact_type ||=  @default_download_artifact_type
            product.downloads = Hash[a.sort_by{|k, v| v.release_date}.reverse]
            if product.current_version
              product.current_download = product.downloads[product.current_version]
            elsif product.downloads.size > 0 
              product.current_download = product.downloads.values[0]
              product.current_version = product.current_download.version
            end
            product.current_download.assets.each do |asset|
              if asset[1].key == product.default_download_artifact_type
                product.default_download_artifact ||= asset[1].artifacts[0]
              end
            end
            # Identify any Betas that need highlighting
            if product.beta_version
              product.beta_download = product.downloads[product.beta_version]
            elsif product.downloads.size > 0 && product.current_download
              candidates = product.downloads.select { |k, v| v.release_date > product.current_download.release_date }
              if candidates.size > 0
                product.beta_download = candidates.values[0]
              end
            end
            if product.beta_download
              if product.beta_download.assets.has_key? product.default_download_artifact_type
                product.beta_download_artifact = product.beta_download.assets[product.default_download_artifact_type].artifacts[0]
              elsif product.beta_download.assets.size > 0
                product.beta_download_artifact = product.beta_download.assets.values[0].artifacts[0]
              end
            end
            product.older_downloads = product.downloads.clone
            product.older_downloads.delete(product.current_download.version) unless product.current_download.nil?
            product.older_downloads.delete(product.beta_download.version) unless product.beta_download.nil?
          end
        end

        def artifact_attr(key, attr, default)
          if @default_download_assets.has_key?(key) && @default_download_assets[key].has_key?(attr)
            @default_download_assets[key][attr]
          else
            default
          end
        end

        def artifact_classifier c1, c2, type
          c1 = c1.empty? ? nil : c1
          c2 = c2.empty? ? nil : c2
          # Remove classifiers that are identical to the type
          c1 = c1 == type ? nil : c1
          c2 = c2 == type ? nil : c2

          if c1 == nil && c2 == nil
            ""
          elsif c1 == c2
            # Only display a classifier once if they are identical
            "-#{c1.downcase}"
          elsif c2 == nil
            "-#{c1.downcase}"
          elsif c1 == nil
            "-#{c2.downcase}"
          else
            "-#{c1.downcase}-#{c2.downcase}"
          end
        end

        def key_to_name(key)
          key = key['name'] if not key.instance_of? String # Hack to deal with regen issues
          key.gsub(/_/, ' ').split.map(&:capitalize).join(' ')
        end

        def release_notes_dir_name(version)
          version[/^([0-9]*\.[0-9]*\.[0-9])/, 1] + "_Release_Notes"
        end

        def docs(product, site)
          product.documentation_path ||= product.name.gsub(/ /, "_")
          product.documentation_minor_version ||= product.current_minor_version
          # Set the documentation url to the default value, if not set
          product.documentation_url ||= site.product_documentation_base_url + product.documentation_path
          # Process the guides declared for the product
          a = {} 
          product.guide_base_url ||= "#{product.documentation_url}/#{product.documentation_minor_version}"
          if product.guides
            product.guides.each do |k, v|
              guide = OpenStruct.new(v)
              guide.name ||= k.gsub(/_/, ' ')
              # We do some special magic for release notes, to avoid the guide name needing continual updates
              if k == "Release_Notes" && product.current_version
                guide.dir_name = release_notes_dir_name(product.current_version)
              else
                guide.dir_name = k
              end
              guide.formats ||= @default_guide_formats.clone
              guide.locale ||= @default_locale
              b = {}
              guide.formats.each do |l, w|
                format = OpenStruct.new(w)
                format.name ||= l
                if ["pdf", "epub"].include? format.name
                  format.url ||= "#{product.guide_base_url}/#{format.name}/#{guide.dir_name}/#{product.documentation_path}-#{product.documentation_minor_version}-#{guide.dir_name}-#{guide.locale.gsub(/_/, "-")}.#{format.name}"
                else 
                  format.url ||= "#{product.guide_base_url}/#{format.name}/#{guide.dir_name}"
                end
                b[l] = format
              end
              guide.formats = b
              a[k] = guide
            end
          end
          product.guides = a
        end
      end
    end
  end
end
