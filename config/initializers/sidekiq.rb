default_config = { namespace: "koi_pwa" }

Sidekiq.configure_server do |config|
  config.redis = default_config
  # if scheduled jobs execute later than than expected uncomment this next line
  # this should reduce the polling to 5 seconds
  # config.poll_interval = 5
end

Sidekiq.configure_client do |config|
  config.redis = default_config
end
