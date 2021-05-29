# jboss-developer-site

## Getting Started
This section covers the steps you need to do in order to set up your environment and get the site running for the first time. Further sections cover the details.

1. Configure environment variables needed for the site.
    * Request the following values from the JBoss Developer team:
    
            vimeo_access_token_secret
            vimeo_client_secret
            vimeo_access_token
            dcp_user
            dcp_password
            google_api_key

    * Export the values in the appropriate startup script. For example:

            export vimeo_access_token_secret=<VIMEO_ACCESS_TOKEN_SECRET>
            export vimeo_client_secret=<VIMEO_CLIENT_SECRET>
            export dcp_user=<DCP_USER>
            export dcp_password=<DCP_PASSWORD>

   Alternatively, if you plan to do frequent development on the site, you can request access to the password vault. The password vault is checked in to git (so always contains an up-to-date version of all keys, passwords, and usernames), and is encrypted using GPG. To request access from the JBoss Developer team, send them the email address associated with your GPG key. To find out more about GPG (including how to create a key) read https://www.gnupg.org/gph/en/manual.html. If you are on Mac, we recommend GPGSuite which provides Keychain management for your GPG key.

2. Configure the software.
    _NOTE:_ You must use a version of Ruby installed via RVM.
    * Install RVM from here http://rvm.io if you don't already have it.
    * [upgrade RVM](http://rvm.io/rvm/upgrading).
    * Install the correct Ruby version (See [here](http://stackoverflow.com/questions/22605921/fresh-installs-of-rvm-and-ruby-2-1-1-dyld-library-pathing-error) for details on why '--disable binary is needed):

            rvm install ruby-2.1.2 --disable-binary
            
    * If you see the `Error running 'requirements_osx_brew_libs_install Autoconf automake libtool pkg-config libyaml readline libksba openssl'` error message, you may need to run the following, and then retry the above install command:
    
            rvm requirements
            
    * Install any required supporting software. For example, on Fedora you may need to:

            sudo yum install -y rubygem-nokogiri
            sudo yum install -y gcc ruby-devel libxml2 libxml2-devel libxslt libxslt-devel
            sudo sysctl fs.inotify.max_user_watches=524288
            sudo sysctl -p
3. Fork the project, then clone your fork and add the upstream repository.
 
         git clone git@github.com:YOUR_USER_NAME/www.jboss.org.git
         cd www.jboss.org
         git remote add -f upstream git@github.com:jboss-developer/www.jboss.org.git

4. Bootstrap the environment (only needed the first time)
        
        bundle install

5. Configure the environment:

        rake setup

6. Build the site for display at <http://localhost:4242>
        rake clean preview

_NOTE_ The site will take a long time to build for the first time (10 minutes+). Subsequent builds are much quicker.

If the build was successful, you should be able to visit the site here: <http://localhost:4242>


## Development

New pages should be added to the root with the extension `.html.slim`

### Updating the DCP

Updates to the DCP should happen automatically if the build is being done on the build server, however, if
it is down or there is another emergency situation and the site needs to be built and content pushed to the
DCP for staging or production please contact Pete Muir, Jason Porter, Andrew Rubinger, or Ray Ploski. Below
are steps to set up the environment for pushing content to the DCP.

In order to update content in the DCP, you must have the URL set in config.yaml and the following two environment variables set: 

    export dcp_user=jboss-developer
    export dcp_password=<see one of the people above for this>

If these two variables are not set you will see a warning during the build:

    Missing username and/or password for search

You can then preview the staging site, which will also push data to the DCP staging server:

    rake preview[staging]
    
Alternatively, you can preview/deploy to staging or production and the associated DCP server will also be updated.

## Deployment

Run `rake deploy[staging]` or `rake deploy[production]`

To tag:

`rake deploy[staging,tagname]`

To run in Awestruct in development mode, execute:

`rake`

To run Awestruct while developing, execute:

`rake preview`

To clean the generated site before you build, execute:

`rake clean preview`

To deploy using the production profile, execute:

`rake deploy

To get a list of all tasks, execute:

`rake -T`

Now you're Awestruct with a rake!

## Release Process

For example, to release 1.0.Beta6:

    rake update
    rake "clean[all]" "deploy[staging]"

The site is now deployed to www-stg.jboss.org. You need to go there and check it looks right. If it is, you can deploy to www-beta.jboss.org:
    
    rake "clean[all]" "deploy[beta,1.0.Beta6]"
    
Finally, you need to commit the new version of `_cdn/cdn.yml` and push that and the new tag upstream. _NOTE:_ It is very important that you remember to commit+push your changes to cdn.yml.

    git commit -a -m “Updated cdn.yml” _cdn/cdn.yml
    git push upstream master
    git push upstream --tags

## Continuous integration

Builds occur automatically when pull requests are submitted, and builds, and deploys, happen when pushes to the master branch occur.

### Tracking CI Intermittent Failures
In order to improve the stability of the CI jobs, we need to track the intermittent failures and target the more frequent ones for resolution. The process is:

Carry out the steps below for each of the jobs on here: https://jenkins.mw.lab.eng.bos.redhat.com/hudson/view/jboss.org. Ignore the jobs named after a JIRA issue (e.g. DEVELOPER-1234) as they are set up to debug a particular issue and are the responsibility of the creator to inspect.

Open the job page. E.g: https://jenkins.mw.lab.eng.bos.redhat.com/hudson/view/jboss.org/job/www.jboss.org/ and for each, not yet documented, failed run:

1.  Select the job
2.  Select 'Console Output'
3.  Inspect the output. If it's a new issue, create a JIRA issue. If it's an existing issue, locate the JIRA id. Note: for 'www.jboss.org-pull-player-executor' failures, you need to find out if it was caused by the code changes in the relate pull request, or if it's an intermittent build issue, unrelated to the PR.
4.  Return to the 'status' page of the run
5.  Select 'keep this build forever
6. Update the description to contain just the JIRA id (e.g. DEVELOPER-1234)
7. Update [this spreadsheet](https://docs.google.com/a/redhat.com/spreadsheets/d/1KrHGJ7_eKzSy-3S6ZXqVFPNC1obEBjSSpSR9XkqLlow/edit#gid=0)
  1. If the failure is already known, increment the occurrences column and the 'last failure' date.
  2. If the failure is new, add a new row to the spreadsheet
  
When an issue is resolved:

1. Mark the status as resolved in [this spreadsheet](https://docs.google.com/a/redhat.com/spreadsheets/d/1KrHGJ7_eKzSy-3S6ZXqVFPNC1obEBjSSpSR9XkqLlow/edit#gid=0)
2. Delete every CI run that failed with this issue.


## secrets.gpg management

The `secrets.yaml.gpg` file is encrypted using GPG with multiple recipients. A plugin for vim such as vim-gnupg (https://github.com/jamessan/vim-gnupg) makes editing the file easy:

1. Install vim and vim-gnupg e.g. using pathogen
2. Open the file `_config/secrets.yaml.gpg` using vim
3. Use the command `:GPGEditRecipients` to open the recipient list
4. Add the email address for the relevant user to the bottom of the edit area
5. Write and quit this edit area, and the main file using `:wq` and `:wq`
6. Commit the updated `_config/secrets.yaml.gpg`

In order to do this, you will need to load the user's public key into your keychain. You will need to add the key to your keychain using your preferred tool on your platform. For example, we recommend GPGSuite for Mac OS. In this case:

1. load `GPG Keychain Access` application
2. Select `key` -> `Retrieve from key server`
3. Pass in the ID of the public key you need to add. 

Minimally the following list of recipients is required to encrypt the file:

* Pete Muir <pmuir@bleepbleep.org.uk> (ID: 0x6CE6E8FB45FE317D created at Mon 1 Sep 18:29:07 2014
* Jason Robert Porter (new key) <lightguard.jp@gmail.com> (ID: 0xBEDFCFB30FB72D11 created at Tue 24 Dec 06:51:51 2013)
* Wes Bos <wesbos@gmail.com> (ID: 0x8C1F9282110E7CA0 created at Tue 2 Sep 17:13:12 2014)
* Rafael Benevides <benevides@redhat.com> (ID: 0x81C7CA49C57D4F5C created at Thu 2 Aug 20:14:57 2012)
* Daniel Coughlin <Daniel.coughlin86@gmail.com> (ID: 0x91A225F08D1D811B created at Tue 2 Sep 17:19:02 2014)
* Paul Robinson <paul.robinson@redhat.com> (ID: 0xBCE89FD63FBB22CF created at Wed 10 Sep 15:08:22 2014)
* Adela Arreola <aarreola@redhat.com> (ID: 0xC946E35184EBDCF7 created at Tue 7 Oct 15:26:21 2014)
* Markus Eisele (myfear) <markus@jboss.org> (ID: 0xBE0AACE30C6FAC25 created at Tue 16 Dec 13:11:42 2014)
* James Parenti (JBoss Developer Site Key) <james@visuale.net> (ID: 0x21BF1DFDC7A143E0 created at Tue 10 Mar 14:33:51 2015)
* Ryszard Koźmik <rkozmik@redhat.com> (ID: 0x70E45BDE7C68C64D created at Mon 11 May 16:09:19 2015)
* Lukas Vlcek (Lukas Vlcek) <lvlcek@redhat.com> (ID: 0x3442A3D7BD324826 created at Fri 22 May 11:24:48 2015)

If you add a new recipient to the file, ensure you update the list above.

## Common issues
This area document fixes to common issues:


### "Too many open files"
This can be caused by running out of file descriptors. Currently only seen on Macs. See the following for how to fix: http://superuser.com/questions/433746/is-there-a-fix-for-the-too-many-open-files-in-system-error-on-os-x-10-7-1

### "An error occurred: getaddrinfo: nodename nor servname provided, or not known"
Same fix as "Too many open files"

### "Unable to decrypt vault (GPGME::Error::BadPassphrase)" 
If using GNU PGP, sometimes you're not presented with a popup asking for the passphrase. This will result in the following error being presented:  `Unable to decrypt vault (GPGME::Error::BadPassphrase)`.
To fix this, use the instructions in the following URL:
https://www.gnupg.org/documentation/manuals/gnupg/Invoking-GPG_002dAGENT.html
