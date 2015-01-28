FROM centos:centos7
MAINTAINER Pete Muir <pmuir@bleepbleep.org.uk>

# install deps required by our build
RUN yum install -y epel-release which tar bzip2 gcc ruby-devel libxml2 libxml2-devel libxslt libxslt-devel libcurl-devel git

# Add RVM keys
RUN gpg2 --keyserver hkp://keys.gnupg.net --recv-keys D39DC0E3

# Install RVM
RUN curl -L get.rvm.io | bash -s stable
RUN /bin/bash -l -c "rvm requirements && rvm autolibs enable"

# Install Ruby
ADD ./.ruby-version /tmp/
ADD ./.ruby-gemset /tmp/
RUN /bin/bash -l -c "rvm install `cat /tmp/.ruby-version`"

## Build setup
# Build the current gemset (user will only need to build the difference 
ADD ./Gemfile /tmp/
ADD ./Gemfile.lock /tmp/
ADD ./Rakefile  /tmp/
WORKDIR /tmp/
RUN /bin/bash -l -c "bundle install"

# Enable GPG support
VOLUME /gnupg
ENV GNUPGHOME /gnupg
RUN touch /tmp/gpg-agent.conf
RUN echo 'export GPG_TTY=$(tty); eval $(gpg-agent --daemon --no-use-standard-socket --options /tmp/gpg-agent.conf );' >> ~/.bash_profile

# Add the volume for the actual project
VOLUME /www.jboss.org
WORKDIR /www.jboss.org

# Prevent encoding errors
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV LC_ALL en_US.UTF-8

EXPOSE 4242

ENTRYPOINT [ "/bin/bash", "-l", "-c" ]
CMD [ "rake", "setup", "preview" ]

