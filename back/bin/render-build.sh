set -o errexit

bundle install
bundle exec rails assets:clean
bundle exec rails db:migrate